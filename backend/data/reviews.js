// 演示评价：按商品 image 关联；user 取 data/users.js 的下标（0=Admin, 1=John, 2=Jane）
// seeder.js 会据此写入 reviews，并计算 rating（平均分）与 numReviews（条数），保证页面上的评分有数据支撑
const reviews = {
  '/images/airpods.jpg': [
    { user: 1, rating: 5, comment: '连接很快，通勤降噪够用，续航比预期好。' },
    { user: 2, rating: 4, comment: 'Comfortable fit and clear calls. Case picks up scratches easily.' },
  ],
  '/images/phone.jpg': [
    { user: 1, rating: 4, comment: '拍照和屏幕都很满意，就是有点重。' },
    { user: 2, rating: 4, comment: 'Great camera in low light. Battery easily lasts a full day.' },
  ],
  '/images/camera.jpg': [
    { user: 1, rating: 3, comment: '对焦准，入门够用；机身偏大，出门不太方便。' },
    { user: 2, rating: 4, comment: 'Solid build and fast autofocus. The kit lens is just okay.' },
  ],
  '/images/playstation.jpg': [
    { user: 1, rating: 5, comment: '加载速度飞快，手柄震动反馈很惊艳。' },
    { user: 2, rating: 5, comment: 'Quiet, fast and the controller feels amazing.' },
  ],
  '/images/mouse.jpg': [
    { user: 1, rating: 4, comment: '手感扎实，按键清脆，灯效可以关掉。' },
    { user: 2, rating: 3, comment: 'Good sensor, but a bit small for large hands.' },
  ],
  '/images/alexa.jpg': [
    { user: 1, rating: 4, comment: '放卧室当闹钟和小音箱，音质超出价位。' },
    { user: 2, rating: 4, comment: 'Handy for timers and music. Voice pickup works across the room.' },
  ],
};

export default reviews;
