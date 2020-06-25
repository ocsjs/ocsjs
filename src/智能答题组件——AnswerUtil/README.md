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
### 结果：
[2] - Array()

## 思路

 * 第一
 * 1。先做全等判断：
 * 2。去掉句号，逗号，空格，回车，等特殊字符再判断
 * 3。去除除了中文，数字，日文，韩文，英文字符，再判断
 * 
 * 第二
 * 1。模糊判断
 * 2。去掉句号，逗号，空格，回车，等特殊字符再模糊判断
 * 3。去除除了中文，数字，日文，韩文，英文字符，再模糊判断
 * 4。字符串每个字符进行对比，判断相似度
 * 5。从题目当中判断是否包含答案，模糊判断
 * 
 * 第三（特殊情况）
 * 1。直接给答案
 * 2。判断题

