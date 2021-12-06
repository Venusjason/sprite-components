---
title: FAQ
order: 3
group:
  path: /
nav:
  title: FAQ
  path: /docs
---

## FAQ

### `Form` 当中 `initialValues`

`ProComponents` 底层也是封装的 [antd](https://ant.design/index-cn) ，所以用法也是和 [antd](https://ant.design/index-cn) 相同。注意 `initialValues` 不能被 `setState` 动态更新，你需要用 `setFieldsValue` 来更新。 `initialValues` 只在 `form` 初始化时生效且只生效一次，如果你需要异步加载推荐使用 `request`，或者 `initialValues ? <Form/> : null`

## 错误和警告

这里是一些你在使用 ProComponents 的过程中可能会遇到的错误和警告，但是其中一些并不是 ProComponents 的 bug。

### Cannot read property 'Provider' of undefined

请确保 antd 的版本 >= `4.11.1`
