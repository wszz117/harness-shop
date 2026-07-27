"""定位 node/npm/npx 可执行文件路径（hook 进程 PATH 可能不含 nvm 等安装位置）。"""
import os
import shutil

_EXTRA_DIRS = [
    "/usr/local/bin",
    "/usr/bin",
    os.path.expanduser("~/.nvm/current/bin"),
    os.path.expanduser("~/.local/bin"),
    "/opt/homebrew/bin",
]


def _augmented_path() -> str:
    parts = os.environ.get("PATH", "").split(os.pathsep)
    for d in _EXTRA_DIRS:
        if d not in parts and os.path.isdir(d):
            parts.append(d)
    # nvm 多版本目录
    nvm_versions = os.path.expanduser("~/.nvm/versions/node")
    if os.path.isdir(nvm_versions):
        for v in sorted(os.listdir(nvm_versions), reverse=True):
            b = os.path.join(nvm_versions, v, "bin")
            if os.path.isdir(b) and b not in parts:
                parts.append(b)
    return os.pathsep.join(parts)


def node_env() -> dict:
    """返回补全了 node 路径的环境变量副本。"""
    env = dict(os.environ)
    env["PATH"] = _augmented_path()
    return env


def which(cmd: str) -> str | None:
    return shutil.which(cmd, path=_augmented_path())
