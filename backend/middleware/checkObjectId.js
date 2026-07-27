import { isValidObjectId } from 'mongoose';

// 校验 :id 是否为合法 Mongo ObjectId —— 非法 id 统一 404，防止 CastError 500
function checkObjectId(req, res, next) {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error(`Invalid ObjectId of: ${req.params.id}`);
  }
  next();
}

export default checkObjectId;
