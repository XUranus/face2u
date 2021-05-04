# -*- coding: UTF-8 -*-
from PIL import Image
from keras.preprocessing import image
import numpy as np
from numpy import *
from keras.models import load_model

class Solver:
    # 模型加载
    def __init__(self):
        self.model = load_model("./emotion_model.h5")
        print("model loaded")

    #raw_arr 带透明度的RGBX
    def one_dim_arr_to_img(self,raw_arr,width,height):
        #去除透明度
        new_arr = []
        for i in range(0,len(raw_arr)):
            if (i+1)%4!=0:
                new_arr.append(raw_arr[i])
        img_mtx = np.array(new_arr,'uint8').reshape((height,width,3))

        img = Image.fromarray(img_mtx, 'RGB')
        #img.save('my.png')
        img = img.resize((48, 48),Image.ANTIALIAS)
        gray_img = img.convert('L')
        return image.img_to_array(gray_img)

    def predict(self,img_array):
        img_array= np.expand_dims(img_array, axis = 0)
        img_array /= 255
        print(img_array)
        print(img_array.shape)
        res = self.model.predict(img_array)
        return res