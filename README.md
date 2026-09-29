[![GitHub Actions nightly CI status](https://img.shields.io/github/actions/workflow/status/certbot/certbot/nightly.yml)](https://github.com/certbot/certbot/actions/workflows/nightly.yml)

<img src="https://raw.githubusercontent.com/EFForg/design/master/logos/certbot/eff-certbot-lockup.png" width="200" alt="EFF Certbot Logo">

Certbot 是 EFF（电子前沿基金会）为加密整个互联网所做出努力的一部分。Web 上的安全通信依赖 HTTPS，而 HTTPS 需要使用数字证书，以便浏览器验证 Web 服务器的身份（例如，这真的是 google.com 吗？）。Web 服务器从被称为证书颁发机构（CA）的可信第三方获取证书。Certbot 是一个易于使用的客户端，它从 Let's Encrypt——一个由 EFF、Mozilla 及其他机构发起的开放证书颁发机构——获取证书，并将其部署到 Web 服务器上。

任何搭建过安全网站的人都知道，获取并维护证书是一件多么麻烦的事。Certbot 和 Let's Encrypt 可以把这些痛苦自动化掉，让你用简单的命令就能开启并管理 HTTPS。使用 Certbot 和 Let's Encrypt 是免费的。

<a id="installation"></a>

## 快速开始

入门的最佳方式是使用我们的[交互式指南](https://certbot.eff.org)。它会根据你的配置设置生成对应的操作说明。在大多数情况下，运行 Certbot 需要你的 Web 服务器具备[超级用户或管理员权限](https://certbot.eff.org/faq/#does-certbot-require-root-administrator-privileges)。

Certbot 应当直接在你的 Web 服务器上通过命令行运行，而不是在你的个人电脑上。如果你使用的是托管服务，且无法直接访问自己的 Web 服务器，那么你可能无法使用 Certbot。请向你的托管服务商咨询有关上传证书或使用 Let's Encrypt 所签发证书的文档。

## 参与贡献

如果你想为这个项目做贡献，请先阅读[开发者指南](https://certbot.eff.org/docs/contributing.html)。

本项目受 [EFF 公共项目行为准则](https://www.eff.org/pages/eppcode) 约束。

## 相关链接

- 文档：https://certbot.eff.org/docs
- 软件项目：https://github.com/certbot/certbot
- 更新日志：https://github.com/certbot/certbot/blob/main/certbot/CHANGELOG.md
- 面向贡献者：https://certbot.eff.org/docs/contributing.html
- 面向用户：https://certbot.eff.org/docs/using.html
- 主网站：https://certbot.eff.org
- Let's Encrypt 官网：https://letsencrypt.org
- 社区：https://community.letsencrypt.org
- ACME 规范：[RFC 8555](https://tools.ietf.org/html/rfc8555)
- ACME 在 GitHub 上的工作区（已归档）：https://github.com/ietf-wg-acme/acme

## 当前特性

- 支持多种 Web 服务器：
  - Apache 2.4+
  - nginx/0.8.48+
  - webroot（向 webroot 目录中添加文件，以证明对域名的控制权并获取证书）
  - standalone（运行自身简易 Web 服务器，以证明你对某个域名的控制权）
  - 通过[第三方插件](https://certbot.eff.org/docs/using.html#third-party-plugins)支持其他服务器软件
- 私钥在你的系统本地生成。
- 可与 Let's Encrypt CA 通信，也可选择性地与其他兼容 ACME 的服务通信。
- 可获取域名验证（DV）证书。
- 可吊销证书。
- 支持 ECDSA（默认）与 RSA 证书私钥。
- 可选择安装 http → https 重定向，使你的站点实际上仅以 https 运行。
- 完全自动化。
- 配置变更会被记录，并且可以回滚。

## 致谢

我们感谢以下机构捐赠的额度，帮助我们测试与开发 Certbot：

[![DigitalOcean Logo](https://opensource.nyc3.cdn.digitaloceanspaces.com/attribution/assets/SVG/DO_Logo_horizontal_blue.svg)](https://www.digitalocean.com/)
