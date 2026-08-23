+++
title = "Cybersecurity in Medical Devices: Quality Management System Considerations and Content of Premarket Submissions 解析 - Chapter 1"
date = 2026-06-04T23:45:00+08:00
series_order = 1
slug = "cybersecurity-in-medical-devices-quality-management-system-considerations-and-content-of-premarket-submissions-chapter-1-20260604-235121"
tags = ["Cybersecurity in Medical Devices: Quality Management System Considerations and Content of Premarket Submissions"]
draft = false
+++

本文章是作者基于 FDA 2026 年 2 月发布的《Cybersecurity in Medical Devices: Quality Management System Considerations and Content of Premarket Submissions》的个人解读。

（相关档案原文链接：https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cybersecurity-medical-devices-quality-management-system-considerations-and-content-premarket）



# 从一条人命到另一个：网络安全为什么成了患者安全问题

2020 年 9 月 10 日，德国杜塞尔多夫大学医院的 IT 系统突然瘫痪。不是停电，不是硬件故障，是勒索软件。整个医院的网络被锁死，急诊被迫关闭，救护车被分流到别处。

一名危重女患者被紧急转送到 32 公里外的另一家医院。路程不算远，但在抢救的语境下，32 公里足以改写结局。她最终因延误治疗死亡。德国警方随后对这起网络攻击启动了谋杀调查。这是目前已知的第一起网络攻击直接导致患者死亡的案例。

FDA 在 2026 年 2 月发布的这份网络安全指南里，脚注 9 引用了这个事件。指南的开头写得克制，但意思很清楚：网络安全事件已经不再是"数据泄露"或者"IT 部门加班"的范畴，它可以直接打断患者护理，可以死人。

---

## 另一条人命

五年后，2025 年，美国加州一名 19 岁大学生 Sam Nelson 向 ChatGPT-4o 咨询药物问题。他不是想自杀，只是想缓解不适。AI 没有拒绝回答，反而给了他具体的剂量建议，甚至推荐他将具有阿片类效果的草药 Kratom 与处方药 Xanax 混合使用，说是可以缓解恶心。

他照做了。药物过量，死亡。

2026 年 5 月，他的父母把 OpenAI 和 Sam Altman 告上了法庭。诉状里提到，OpenAI 为了抢在谷歌发布会前上线 GPT-4o，把原本数月的安全测试压缩到了一周。模型的部分安全围栏被弱化，违禁内容限制自相矛盾。

这个案子目前还在民事诉讼阶段，没有监管机构的行政处罚。ChatGPT 本身也不被 FDA 认定为医疗器械。但两起事件并排放在一起，你会发现它们指向同一个问题：

软件的安全缺陷，不管是外部黑客打穿进来的，还是内部设计没拦住 AI 乱说话的，最终都可以回到患者身上。

---

## 网络安全 = 患者安全

FDA 这份 2026 年的指南，全称很长，核心意思却很简单：医疗器械的网络安全，不再是上市后的补丁工作，而是上市前的设计底线。

以前的逻辑大致是：先把设备做出来上市，出了漏洞再发补丁。这套逻辑在普通消费电子里跑得通，在手机和电脑上，用户容忍度很高。但在医院里，一台呼吸机如果因为网络问题停摆，或者一台胰岛素泵因为固件漏洞被远程操控，患者的生命容忍度是零。

所以 FDA 把网络安全直接并入了 QMSR（质量管理体系法规），也就是 21 CFR Part 820。网络安全不是额外加出来的合规负担，它就是设备安全和有效性的一部分。指南的原话是：

> Cybersecurity is part of device safety and the Quality Management System Regulation.

这句话的份量在于，它把网络安全从 IT 部门的课后作业，变成了产品设计阶段的内置属性。不管你做的是起搏器、CT 机、还是一块带蓝牙的血压计，只要里面有软件、有固件、有可编程逻辑，网络安全就必须从第一天开始考虑。

---

## AI 让这个边界更模糊了

ChatGPT 开药方的案子之所以值得放在这里聊，不是因为它直接受这份指南管辖，而是因为它预示了下一个十年的麻烦。

今天的 ChatGPT 只是一个聊天机器人，不算医疗器械。但如果同样的模型被嵌入到一台监护仪里，辅助医生判断病情？或者被封装成一个 App，让患者上传症状后给出用药建议？这时候它就变成了 Software as a Medical Device（SaMD），FDA 的管辖范围立刻覆盖上来。

而这份 2026 年的指南，在 Section IV.B 里专门提了一句：

> including, but not limited to, devices containing artificial intelligence (AI) and cloud-based services.

AI 不是例外，是包含在内。而且 AI 在网络安全上的脆弱面比传统软件更多：训练数据可以被投毒，推理输入可以被对抗性攻击篡改，模型本身可以漂移。这些不是未来的科幻场景，是现在的工程问题。

更麻烦的是，现在的 LLM 训练过程很大程度上是黑箱。厂商不会公开训练数据的完整来源和清洗过程，外界实际上无法独立验证模型到底"学过什么"。即便某些基准测试声称模型通过了美国执业医生考试，也不等于它具备了在临床场景下安全做决策的能力，更不等于它自动进入了医疗器械的监管框架。FDA 的指南管的是被明确定义为医疗器械的产品，而不是所有"看起来很医学"的 AI，就算是他们面前宣称自己就是医疗用途也不行。这个灰色地带，正是风险最容易漏过去的地方。

---

## 接下来聊什么

这份指南总共 64 页，结构很清晰。但如果你直接翻开正文，会被一堆缩写砸晕：SPDF、QMSR、ISO 13485、SBOM、SRM、SaRM、524B……

下一篇我会把这些概念一个个拆开，讲清楚它们是什么、从哪里来、为什么 FDA 非要在这个时候把它们拧在一起。再往后，我们会聊到安全控制怎么做、SBOM 怎么写、以及 Cyber Device 在 524B 条款下到底要交什么文档。

网络安全从来不是一个纯粹的技术问题。在医疗器械这个领域，它最终都会回到一个问题：这个设计决策，会不会在某一间病房里，让某一个人失去被及时救治的机会。

杜塞尔多夫的那个秋天，和加州的那个夜晚，已经给出了答案。

---

*（未完待续）*
