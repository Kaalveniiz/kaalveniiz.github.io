+++
title = "Cybersecurity in Medical Devices: Quality Management System Considerations and Content of Premarket Submissions 解析 - Chapter 2"
date = 2026-06-04T23:45:00+08:00
series_order = 2
slug = "cybersecurity-in-medical-devices-quality-management-system-considerations-and-content-of-premarket-submissions-chapter-2-20260604-235312"
tags = ["Cybersecurity in Medical Devices: Quality Management System Considerations and Content of Premarket Submissions"]
draft = false
+++

# SPDF、QMSR、ISO 13485……FDA 指南里这些缩写都是什么？


> 如果你没听说过这些名字，这篇就是为你写的。

前面一篇聊了 FDA 为什么要发这份新指南。但如果你直接翻开正文，会被一堆缩写砸晕：SPDF、QMSR、ISO 13485、SBOM、JSP2、524B……

这一篇的任务很简单：把这些概念一个个拆开，讲清楚它们是什么、从哪里来、为什么 FDA 非要在这个时候把它们拧在一起。以及，中国国内认什么。

---

## 一个比喻：造汽车

以前造医疗器械，只要设备能完成预定功能就行，就像造一辆车，能跑就行。

现在不一样了。你的车不仅得能跑，还得有刹车、气囊、ESP、胎压监测，而且每一环都要有文档证明它安全。SPDF 就是这个"全过程安全设计手册"，QMSR 和 ISO 13485 则是整个工厂的质量管理规范。网络安全不是额外加出来的选配，是底盘的一部分。

---

## QMSR 与 ISO 13485

**QMSR** 全称是 Quality Management System Regulation，即质量管理体系法规。它是 FDA 在 2026 年 2 月对 21 CFR Part 820 的全面修订版。

Part 820 是美国老版的质量体系法规，从 1997 年用到现在。2026 年的核心变化只有一条：**直接引用 ISO 13485:2016**。

**ISO 13485:2016** 是国际标准化组织（ISO）专门针对医疗器械发布的质量管理体系标准。它不是美国独有的，全球大部分监管机构都认，包括欧盟、日本、澳大利亚、加拿大。中国也认，只是换了个编号叫 YY/T 0287-2017，内容一模一样。

ISO 13485 的核心逻辑是：从设计、采购、生产到上市后监控，每一步都要有可控的流程。而网络安全在 ISO 13485 里不是新增章节，而是被自然覆盖在既有条款里的：

- **Subclause 7.1（风险管理）**：要求组织建立文件化的风险管理流程。网络安全风险是风险的一种，被明确包含在内。
- **Subclause 7.3（设计开发）**：要求设计开发输出包含验证和确认证据。网络安全控制的设计、验证、测试，都是这一条的子集。

所以 FDA 的意思是：你本来就要按 ISO 13485 做质量管理，网络安全只是这个框架里的一个维度，不是额外加的任务。

---

## SPDF 到底是什么

**SPDF** 全称 Secure Product Development Framework，安全产品开发框架。

它不是一个标准，也不是 FDA 发明的东西。它是一类方法论，覆盖产品的全生命周期：设计 → 开发 → 发布 → 维护 → 退役。核心理念很简单：漏洞越少，补丁越少，患者越安全。

SPDF 的关键产出包括：
- 威胁模型（Threat Model）
- 网络安全风险评估报告
- 安全架构文档
- 测试证据
- SBOM（软件物料清单）

### SPDF 和 GitHub 上提 Issue 有什么区别？

这是个好问题。很多做软件的人习惯了 GitHub 的工作流：发现 bug → 开 issue → 等 maintainer 回复 → 发 PR → 合并 → 发 release。社区驱动，流程透明，但没人对你的患者负责。

SPDF 要求的是另一套逻辑：

| 环节 | GitHub 开源社区 | SPDF / 医疗器械 |
|------|----------------|----------------|
| 发现漏洞 | 任何人开 issue | 内部安全事件响应流程 |
| 评估影响 | 看 issue 热度 | 评估对患者安全的具体影响 |
| 修复优先级 | maintainer 自己排 | 按患者安全风险强制分级 |
| 验证 | 社区测试 | 内部验证 + 监管文档 |
| 披露 | 公开 issue 讨论 | 按 FDA Postmarket Guidance 协调披露（CVD） |
| 推送补丁 | 发 release | 安全、及时、可验证的更新机制 |

核心区别是**责任主体不同**。GitHub 上开源作者可以说"我没空修"，医疗器械厂商不能说。FD&C Act Section 524B(b)(2) 明确要求厂商 "design, develop, and maintain processes and procedures to provide a reasonable assurance of cybersecurity"。**maintain** 是法律义务，不是社区礼貌。

---

## 其他等效框架

FDA 说 SPDF 是满足 QMSR 的一种方式，但不是唯一方式。厂商也可以用其他框架，只要等效。指南里提到了几个：

**JSP2**（Medical Device and Health IT Joint Security Plan）

由 MITRE 牵头，医疗器械和健康 IT 行业联合搞的安全计划。非常贴近 FDA 的语境，里面很多控制要求和 FDA 指南高度一致。如果你做美国市场，JSP2 是最省事的参照之一。

**IEC 81001-5-1**

国际电工委员会出的医疗器械网络安全标准，欧洲认这个的比较多。如果你的设备要进欧盟市场，这套标准的出镜率很高。

**ANSI/ISA 62443-4-1**

来自工业自动化控制领域，制造业、能源行业用得很多。思路同样是"安全开发生命周期"，只是语境从工厂车间换到了手术室。跨行业借鉴过来的，但 FDA 认它是等效的。

选一个用就行，不用全做。关键是证明你的流程能产出指南要求的那些文档。

---

## 这些概念怎么串在一起

用造房子的比喻来串：

- **ISO 13485** = 地基。全球通用的质量管理大规范。
- **QMSR** = FDA 把这块地基搬进了美国法规，加了美国的执法牙齿。
- **SPDF** = 在地基上盖的房子，专门解决网络安全问题。
- **JSP2 / IEC 81001-5-1 / 62443-4-1** = 不同的设计图纸，你任选一套，盖好同一栋房子。

最终目标只有一个：证明你的设备在网络安全方面有"合理的安全保证"（reasonable assurance）。

---

## 中国国内认什么？

前面讲的都是美国 FDA 和欧美标准。如果你未来回国做医疗器械，或者设备要进中国市场，对应的体系是这样的：

**质量管理体系**

- **YY/T 0287-2017**《医疗器械 质量管理体系 用于法规的要求》，等同采用 ISO 13485:2016。中美欧在这个地基上是一致的。
- **《医疗器械生产质量管理规范》**（业内叫 GMP），2014 年发布、2015 年实施。相当于中国版的 QSR/QMSR，是 NMPA 现场核查的依据。

**网络安全（直接对应 FDA 这份指南）**

- **《医疗器械网络安全注册审查指导原则（2022年修订版）》**，由国家药监局医疗器械技术审评中心（CMDE）发布。这是中国目前最直接对应 FDA 2026 网络安全指南的文件，同样要求威胁建模、网络安全风险评估、安全控制措施、软件安全性级别划分、网络安全更新。思路和 FDA 基本一致，只是具体文档格式和审评口径有中国自己的习惯。

**软件与 AI 相关**

- **YY/T 0664**《医疗器械软件 软件生存周期过程》
- **《医疗器械软件注册审查指导原则（2022年修订版）》**
- **《人工智能医疗器械注册审查指导原则》**，对应 AI 相关的安全评估

**监管机构对应**

| 美国 | 中国 |
|------|------|
| FDA | NMPA（国家药品监督管理局） |
| CDRH / CBER | CMDE（医疗器械技术审评中心） |

简单来说，FDA 这份指南里的方法论和逻辑，回国一样用得上。只是提交文档的格式和审评沟通方式会有差异。

---

## Security Risk Management vs Safety Risk Management

这是指南里最容易被忽略，但 FDA 特意强调的部分。

### 为什么要分开做？

**Safety Risk Management**（ISO 14971 管）关注的是"设备本身故障会不会伤人"：电池过热、机械夹伤、软件跑飞导致剂量错误。这些是**非恶意的**、设备自身可靠性问题。

**Security Risk Management** 关注的是"有人恶意利用设备的漏洞会不会伤人"：远程操控胰岛素泵、篡改影像数据、勒索软件锁死全院 IT。这些是**有恶意意图的**、外部威胁利用漏洞的问题。

两者的 scope 不同，评估因素不同，不能混在一起做。但更重要的是：**它们不能各做各的**。

### 接口逻辑：两个例子

**例子一：安全关机 vs 远程关机**

Safety 团队设计了一个保护机制：设备在检测到异常时自动关机，防止患者受伤。这是一个合理的 Safety 控制。

Security 团队审查时发现：这个关机功能可以通过网络接口远程触发，且没有额外的认证机制。一个恶意指令就能让全院呼吸机同时停机。

结果：Safety 的控制引入了 Security 风险。两个团队必须对拍，给关机功能加上分层认证，或者把远程关机的权限限制到物理按键。

**例子二：数据加密 vs 实时报警**

Security 团队要求所有数据传输必须加密。Safety 团队反对：加密导致 200ms 延迟，在急救场景下可能延误报警，危及患者生命。

结果：不能一刀切。最终的方案是急救报警数据走隔离的本地网络、不加密但物理隔离；非急救的远程维护数据走公网、必须加密。两个团队在接口上达成了妥协。

### 参考标准

FDA 引用了两个标准来描述这个接口：

- **AAMI TIR57**《Principles for medical device security—Risk management》：描述 Security Risk Management 的流程，以及它和 Safety Risk Management 应该怎么接口。
- **ANSI/AAMI SW96**《Standard for medical device security—Security risk management for device manufacturers》：更具体的要求标准，把 TIR57 的原则落到了可操作的层面。

已知漏洞如果没有完全缓解，必须当作"合理可预见风险"处理。Safety 和 Security 两个评估都要覆盖，但结论要对得上，不能互相矛盾。

---

## 小结

这一篇我们拆解了 FDA 指南里最核心的几个概念：

| 缩写 | 是什么 | 作用 |
|------|--------|------|
| ISO 13485 | 国际医疗器械质量管理体系标准 | 全球通用的地基 |
| QMSR | FDA 把 ISO 13485 搬进美国法规 | 加了美国的执法牙齿 |
| SPDF | 安全产品开发框架 | 在地基上盖网络安全这栋房子 |
| JSP2 / IEC 81001-5-1 / 62443-4-1 | 等效的其他框架 | 不同的设计图纸，任选一套 |
| SRM | Security Risk Management | 防黑客、防恶意利用 |
| SaRM | Safety Risk Management | 防故障、防意外 |
| SBOM | Software Bill of Materials | 软件供应链的 ingredient list |
| 524B | FD&C Act 新增条款 | Cyber Device 的法律义务 |

这些不是各自独立的标准，而是一个拼图。下篇我们会进入更实操的部分：安全控制怎么选、SBOM 怎么写、524B 合规到底要交什么文档。

---

*（未完待续）*
