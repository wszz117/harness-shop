// rating / numReviews 不在此硬编码：由 seeder.js 根据 data/reviews.js 的真实评价计算
const products = [
  {
    name: 'Airpods 无线蓝牙耳机',
    name_en: 'Airpods Wireless Bluetooth Headphones',
    image: '/images/airpods.jpg',
    description:
      '蓝牙技术让您可以轻松连接兼容设备，提供沉浸式高品质音频体验，内置麦克风支持通话。',
    description_en:
      'Bluetooth technology lets you connect it with compatible devices wirelessly. High-quality AAC audio offers immersive listening experience.',
    brand: 'Apple',
    category: '电子产品',
    category_en: 'Electronics',
    price: 89.99,
    countInStock: 10,
  },
  {
    name: 'iPhone 13 Pro 256GB',
    name_en: 'iPhone 13 Pro 256GB Memory',
    image: '/images/phone.jpg',
    description:
      'iPhone 13 Pro 引入全新三摄系统，A15 仿生芯片带来跨越式性能提升，超视网膜 XDR 显示屏。',
    description_en:
      'Introducing the iPhone 13 Pro. A transformative triple-camera system. An unprecedented leap in battery life.',
    brand: 'Apple',
    category: '电子产品',
    category_en: 'Electronics',
    price: 599.99,
    countInStock: 7,
  },
  {
    name: '佳能 EOS 80D 单反相机',
    name_en: 'Cannon EOS 80D DSLR Camera',
    image: '/images/camera.jpg',
    description:
      '以多功能成像规格著称，EOS 80D 拥有 4575 万像素全画幅传感器与强大对焦系统。',
    description_en:
      'Characterized by versatile imaging specs, the Canon EOS 80D further clarifies itself using a pair of robust focusing systems.',
    brand: 'Cannon',
    category: '电子产品',
    category_en: 'Electronics',
    price: 929.99,
    countInStock: 5,
  },
  {
    name: '索尼 PlayStation 5',
    name_en: 'Sony Playstation 5',
    image: '/images/playstation.jpg',
    description:
      '极致的家庭娱乐中心，PlayStation 5 带来 4K 超高清游戏体验与极速 SSD 加载。',
    description_en:
      'The ultimate home entertainment center starts with PlayStation. 4K gaming and lightning-fast SSD loading.',
    brand: 'Sony',
    category: '电子产品',
    category_en: 'Electronics',
    price: 399.99,
    countInStock: 11,
  },
  {
    name: '罗技 G 系列游戏鼠标',
    name_en: 'Logitech G-Series Gaming Mouse',
    image: '/images/mouse.jpg',
    description:
      '通过可编程按键获得更好的游戏控制体验，LIGHTSYNC RGB 灯效随游戏联动。',
    description_en:
      'Get a better handle on your games with this Logitech LIGHTSYNC gaming mouse with six programmable buttons.',
    brand: 'Logitech',
    category: '电子产品',
    category_en: 'Electronics',
    price: 49.99,
    countInStock: 7,
  },
  {
    name: '亚马逊 Echo Dot 智能音箱',
    name_en: 'Amazon Echo Dot 3rd Generation',
    image: '/images/alexa.jpg',
    description:
      'Echo Dot 是一款语音控制智能音箱，支持 Alexa 语音助手，随时为你播放音乐、查询信息。',
    description_en:
      'Meet Echo Dot - Our most popular smart speaker with a fabric design. It is our most compact smart speaker that fits perfectly into small spaces.',
    brand: 'Amazon',
    category: '电子产品',
    category_en: 'Electronics',
    price: 29.99,
    countInStock: 0,
  },
];

export default products;
