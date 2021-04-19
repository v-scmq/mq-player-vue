# mq-player-vue

#### 介绍

MQ音乐是一个基于Electron+Vue构建的一个桌面音乐播放器

#### 软件架构

软件架构说明

#### 安装教程

1. xxxx
2. xxxx
3. xxxx

#### 问题汇集

> 1.electron不能加载本地资源(即使关闭webSecurity安全策略)

问题在于electron版本自身的bug,关闭网页安全仍然不能解决,反而出现了file协议不认识的情况,该问题解决方案在
[问题发现](https://github.com/electron/electron/issues/23664)
[问题解决](https://github.com/electron/electron/issues/23757) . 从解决的方案衍生一个不使用file协议,注册自定义文件协议,这样可以不关闭安全策略 且可以访问本地文件.

```javascript
import {protocol} from "electron";

app.whenReady().then(() => {
    // 注册文件协议必须在应用程序就绪后才能执行
    protocol.registerFileProtocol('fs', (request, callback) => {
        // request请求包含原始请求URL和header等信息
        const pathname = request.url.replace('fs:///', '');

        // callback回调用于将文件(必须)绝对路径传入并做响应信息处理
        callback(pathname);
    });
});

```

> 2.文件上传总结

不论以下哪一种方式,form表单中的按钮默认有提交功能,若需要显示按钮,则应该用`<input type='button' value='按钮文本'/>`

1).前端部分

```html

<html lang>
<head>
    <title></title>
    <style type='text/css'>
        .v-row {
            display: flex;
            align-items: center;
        }

        .v-column {
            display: flex;
            flex-direction: column;
        }
    </style>
</head>
<body>
<div class="v-row">
    <form class="v-column" action="http://localhost:8080//api/upload" enctype="multipart/form-data" method="post">
        <div>通过普通表单上传文件</div>
        <div><input name="name"/></div>
        <div><input type="file" name="file1"/></div>
        <div><input type="file" name="file2"/></div>
        <div><input type="submit" value="上传"/></div>
        <div>
            <button>上传</button>
        </div>
    </form>

    <form class="v-column" id="form-upload">
        <div>通过ajax上传文件</div>
        <div><input name="name"/></div>
        <div><input type="file" id="file1" name="file1"/></div>
        <div><input type="file" id="file2" name="file2"/></div>
        <div><input type="button" id="submit-button" value="上传"/></div>
    </form>
</div>

<script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
<script>
    document.querySelector('#submit-button').onclick = () => {
        let formData = new FormData(document.querySelector('#form-upload'));
        $.ajax({
            type: 'POST',
            data: formData,
            url: "http://localhost:8080/api/upload",
            contentType: false, /* 发送信息至服务器时内容编码类型(String),这里明确指定为false */
            processData: false, /* 发送 DOM 树信息或其它不希望转换的信息,设置为 false */
        }).success(data => {
            console.info('success-data=>', data)
        }).error(data => {
            console.info('error-data=>', data)
        });
    };
</script>
</body>
</html>
```

2)后端部分

```java
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
@Data
public class UploadData {
    private String name;
    private MultipartFile file1;
    private MultipartFile file2;
}


import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

@Controller
@RequestMapping("/api")
public class BaseController {
    @ResponseBody
    @PostMapping("/upload")
    public boolean upload(UploadData data) {
        if (data.getFile1() == null || data.getFile1().isEmpty()) {
            System.out.println("未选择文件！");
        }
        // ......
        return true;
    }
}

```
