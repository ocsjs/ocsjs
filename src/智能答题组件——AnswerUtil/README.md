# 智能答题组件——AnswerUtil


## 说明：
传入 ：题目，答案，多个选项
即可返回较为正确的选项索引。

## 运行实例：
```javascript
var a = new AnswerUtil('中国是什么', ["中华人民共和国（People's Republic of China），简称“中国”"], [

    "A,,SAD中华人民共和国（People's Republic of），简称“中国”",
    "B,C,D中华人民共和国（People's Republic of China），“中国”",
    "C,D中华人民共和国（People's Republic of China），称“中国”",
    "D,DD,中华人民共和国（People Republic of China），简称“中国”"

]);

a.getAnswer()
```
