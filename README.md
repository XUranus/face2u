# 人脸识别 表情分类
使用webcam识别人脸和情绪分类

### 模型训练
使用keras训练，三层卷积 + 一层全连接 + Softmax，训练过程见`kaggle-emotion.ipynb`，数据来自kaggle比赛数据集[fer2013](https://www.kaggle.com/deadskull7/fer2013)

 - 前端：React + face-api.js  
 - 后端：Flask + Keras

人脸Box位置检测使用了face-api.js的库，用canvas截取100×100的人脸图片，转化成RGBA数组，压缩灰化，交由分类器返回分类数据。

### 构建与部署
默认使用`LocalMode`：前端内置了tensorflow.js，可以直接加载训练好的模型，脱离后端独立运行：
```
cd ui
yarn install && yarn start
```
浏览器访问`http://localhost:3000`即可直接体验。

训练好的HDF5格式的模型文件位于`/server/emotion_model.h5`，其中前端`/ui/public/model`下的文件是由其用`tensorflowjs_converter`转化而来的。

不使用`LocalMode`时，即需要额外配置`/ui/src/CameraSection.js`中的Flask服务器地址`serverAddr`，以及`server/server.py`中的Flask服务器地址和端口号，后端依赖安装：`cd server && pip3 install -r requirements.txt`，最后`python3 server.py`启动后端服务器。

> 由于最新的chrome已经禁止了不安全的连接开启userMedia，必须要用https或者在localhost下访问，否则webcam无法使用

### 效果
![](demo.gif)


