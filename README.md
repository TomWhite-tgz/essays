# 材料智能论文精读

本仓库使用 Markdown 编写论文讲解, 使用 VitePress 和 MathJax 构建静态网页, 并通过 GitHub Actions 发布到 GitHub Pages.

## 本地预览

首次使用时安装依赖:

```bash
npm install
```

启动本地预览:

```bash
npm run docs:dev
```

验证生产构建:

```bash
npm run docs:build
```

## 在线编辑

完成初始部署后, 可以直接在 GitHub 网页端编辑 `docs/` 中的 Markdown 文件. 提交到 `main` 或 `master` 分支后, GitHub Actions 会自动构建并重新发布网站.

在仓库的 `Settings > Pages` 中将 `Source` 设置为 `GitHub Actions`.

## 内容与研究材料

- 网站正文位于 `docs/`.
- 需要发布的图片位于 `docs/public/images/`.
- 从 arXiv 下载的 TeX 源码位于 `sources/`, 并由 `.gitignore` 排除.
- 原始论文 PDF 也由 `.gitignore` 排除.

当前完成的第一篇精读是 `arXiv:2405.04967v2`, 即 MatterSim: A Deep Learning Atomistic Model Across Elements, Temperatures and Pressures.
