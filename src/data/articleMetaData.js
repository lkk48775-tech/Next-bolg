/**
 * 文章元数据
 * 
 * 存放博客所有文章的元信息，是整个博客的核心数据源。
 * 
 * 导出：
 * - latestArticles: 最新文章列表（首页侧边栏使用）
 * - techSections: 按技术方向分组的专题数据（首页分页展示）
 * - allHomeArticles: 所有文章的扁平列表（搜索、归档、管理后台使用）
 * 
 * 每篇文章包含：
 * - slug: 唯一标识符（用于生成 URL 路径）
 * - meta: 分类标签（如 "JS 防抖"）
 * - title: 文章标题
 * - desc: 文章描述/摘要
 * - tags: 技术标签数组
 */
export const latestArticles = [
  {
    "slug": "js-debounce",
    "meta": "JS 防抖",
    "title": "认识 JS 防抖",
    "desc": "防抖是一种让频繁触发的操作先安静片刻的处理思路。它常用于搜索输入、窗口缩放、按钮点击等场景，让事件在短时间内多次发生时，只保留最后一次真正需要响应的动作。",
    "tags": [
      "JavaScript",
      "DOM 事件",
      "性能优化"
    ]
  },
  {
    "slug": "js-throttle",
    "meta": "JS 节流",
    "title": "认识 JS 节流",
    "desc": "节流关注的是控制触发频率，让连续发生的事件按照固定节奏响应。它适合滚动监听、拖拽移动、页面尺寸变化等高频场景，让交互保持流畅，也避免函数被过度调用。",
    "tags": [
      "JavaScript",
      "定时器",
      "事件控制"
    ]
  },
  {
    "slug": "virtual-list",
    "meta": "虚拟列表",
    "title": "虚拟列表的思路",
    "desc": "虚拟列表通过只渲染当前可视区域附近的数据，减少大量 DOM 同时存在带来的压力。它常用于长列表、日志面板、数据表格等内容很多但屏幕只能看到一部分的场景。",
    "tags": [
      "React",
      "滚动容器",
      "DOM 优化"
    ]
  },
  {
    "slug": "large-file-upload",
    "meta": "大文件上传",
    "title": "大文件上传概览",
    "desc": "大文件上传通常会围绕切片、并发、断点续传和上传进度展开。它把一个庞大的文件拆成更容易管理的小片段，让上传过程更稳定，也更容易在网络波动后恢复。",
    "tags": [
      "File API",
      "分片上传",
      "断点续传"
    ]
  },
  {
    "slug": "dynamic-breadcrumb",
    "meta": "动态面包屑",
    "title": "动态面包屑目录",
    "desc": "动态面包屑会根据当前路由、菜单配置或页面层级生成导航路径。它能让用户清楚知道自己所在的位置，并快速回到上一级或某个父级页面。",
    "tags": [
      "React Router",
      "路由匹配",
      "菜单配置"
    ]
  },
  {
    "slug": "file-md5",
    "meta": "MD5 计算",
    "title": "文件 MD5 值计算",
    "desc": "MD5 值可以用来标识文件内容，常见于秒传判断、完整性校验和重复文件识别。前端计算 MD5 时通常会结合文件读取、切片处理和进度反馈。",
    "tags": [
      "Hash",
      "Blob",
      "文件校验"
    ]
  }
]

export const techSections = [
  {
    "title": "CSS 介绍",
    "items": [
      {
        "slug": "css-flex",
        "meta": "Flex布局",
        "title": "弹性布局的核心",
        "desc": "Flex 适合处理一维方向上的排列、对齐和空间分配。它常用于导航栏、按钮组、卡片内部结构和左右分栏，让元素在不同宽度下保持自然伸缩。",
        "tags": [
          "CSS",
          "Flex",
          "布局"
        ]
      },
      {
        "slug": "css-grid",
        "meta": "Grid布局",
        "title": "二维网格布局",
        "desc": "Grid 更适合同时控制行和列的页面结构。它可以清晰地描述卡片网格、仪表盘、图片墙和复杂内容区，让布局规则更接近页面本身。",
        "tags": [
          "CSS",
          "Grid",
          "响应式"
        ]
      },
      {
        "slug": "css-responsive",
        "meta": "响应式",
        "title": "适配不同屏幕",
        "desc": "响应式设计通过百分比、弹性尺寸、媒体查询和自适应网格，让页面在桌面、平板和手机上都能保持舒服的阅读与操作体验。",
        "tags": [
          "Media Query",
          "移动端",
          "适配"
        ]
      },
      {
        "slug": "css-transition",
        "meta": "过渡动画",
        "title": "让变化更自然",
        "desc": "Transition 用来描述样式变化的过程，让 hover、展开、位移和透明度变化不再生硬。合适的过渡能提升界面的精致感。",
        "tags": [
          "Transition",
          "Hover",
          "交互"
        ]
      },
      {
        "slug": "css-position-zindex",
        "meta": "定位层级",
        "title": "理解定位和层叠",
        "desc": "position 和 z-index 决定元素如何脱离文档流、如何覆盖其他内容。浮层、固定按钮、提示框和背景装饰都离不开这些概念。",
        "tags": [
          "Position",
          "z-index",
          "浮层"
        ]
      },
      {
        "slug": "css-line-clamp",
        "meta": "文本省略",
        "title": "多行文本截断",
        "desc": "文本省略常用于卡片摘要和列表标题。通过行数限制与溢出隐藏，可以让内容长度不确定的模块依然保持整齐。",
        "tags": [
          "Line Clamp",
          "Overflow",
          "摘要"
        ]
      }
    ]
  },
  {
    "title": "JavaScript 介绍",
    "items": [
      {
        "slug": "js-event-loop",
        "meta": "事件循环",
        "title": "理解异步执行顺序",
        "desc": "事件循环负责协调同步任务、微任务和宏任务。理解它可以帮助判断 Promise、定时器、事件回调之间的执行先后。",
        "tags": [
          "Event Loop",
          "Promise",
          "异步"
        ]
      },
      {
        "slug": "js-closure",
        "meta": "闭包",
        "title": "函数与作用域的关系",
        "desc": "闭包让函数能够记住创建时的作用域。它常出现在封装私有变量、函数工厂、回调和状态保存等场景中。",
        "tags": [
          "Scope",
          "Function",
          "变量"
        ]
      },
      {
        "slug": "js-prototype",
        "meta": "原型链",
        "title": "对象继承的基础",
        "desc": "原型链是 JavaScript 对象查找属性和方法的重要机制。理解它有助于看懂继承、构造函数、class 语法和对象扩展。",
        "tags": [
          "Prototype",
          "Object",
          "继承"
        ]
      },
      {
        "slug": "js-module",
        "meta": "模块化",
        "title": "组织代码边界",
        "desc": "模块化让代码按职责拆分，通过导入导出建立依赖关系。它能降低全局污染，让大型项目更容易维护和协作。",
        "tags": [
          "ESM",
          "Import",
          "Export"
        ]
      },
      {
        "slug": "js-array-methods",
        "meta": "数组方法",
        "title": "常用数据处理",
        "desc": "map、filter、reduce 等数组方法能让数据转换更清晰。它们常用于列表渲染、筛选、统计和接口数据整理。",
        "tags": [
          "Array",
          "Map",
          "Reduce"
        ]
      },
      {
        "slug": "js-error-handling",
        "meta": "错误处理",
        "title": "让异常可控",
        "desc": "错误处理关注代码失败时的兜底方式。try catch、Promise catch 和统一错误提示能让用户体验更加稳定。",
        "tags": [
          "Error",
          "try catch",
          "稳定性"
        ]
      }
    ]
  },
  {
    "title": "Vue 介绍",
    "items": [
      {
        "slug": "vue-reactive",
        "meta": "响应式",
        "title": "数据驱动视图",
        "desc": "Vue 的响应式系统会追踪数据变化，并自动更新依赖这些数据的视图。它让开发者更专注于状态本身，而不是手动操作 DOM。",
        "tags": [
          "Vue",
          "Reactive",
          "状态"
        ]
      },
      {
        "slug": "vue-component-communication",
        "meta": "组件通信",
        "title": "组件之间传递信息",
        "desc": "组件通信用于连接父子组件、兄弟组件和全局状态。props、emit、provide/inject 和状态管理都可以解决不同层级的数据流动。",
        "tags": [
          "Props",
          "Emit",
          "通信"
        ]
      },
      {
        "slug": "vue-composition-api",
        "meta": "组合式 API",
        "title": "按逻辑组织代码",
        "desc": "组合式 API 让状态、计算、监听和方法可以按业务逻辑聚合。复杂组件拆分逻辑时会更清晰，也更方便复用。",
        "tags": [
          "Composition",
          "Setup",
          "复用"
        ]
      },
      {
        "slug": "vue-directive",
        "meta": "指令",
        "title": "模板中的行为表达",
        "desc": "v-if、v-for、v-bind、v-model 等指令让模板具备条件渲染、列表渲染、属性绑定和双向绑定能力。",
        "tags": [
          "Directive",
          "Template",
          "渲染"
        ]
      },
      {
        "slug": "vue-router",
        "meta": "路由",
        "title": "单页应用页面切换",
        "desc": "Vue Router 负责路径和组件的映射。它支持嵌套路由、动态路由、导航守卫和懒加载，是单页应用的基础能力。",
        "tags": [
          "Vue Router",
          "SPA",
          "导航"
        ]
      },
      {
        "slug": "vue-pinia",
        "meta": "Pinia",
        "title": "集中管理共享状态",
        "desc": "Pinia 用于管理跨组件共享的数据。它相比局部状态更适合用户信息、主题配置、权限菜单和缓存数据。",
        "tags": [
          "Pinia",
          "Store",
          "共享状态"
        ]
      }
    ]
  },
  {
    "title": "React 介绍",
    "items": [
      {
        "slug": "react-component",
        "meta": "组件思想",
        "title": "把页面拆成模块",
        "desc": "React 鼓励把界面拆成可复用组件。每个组件负责自己的结构、状态和交互，组合起来形成完整页面。",
        "tags": [
          "React",
          "Component",
          "复用"
        ]
      },
      {
        "slug": "react-hooks",
        "meta": "Hooks",
        "title": "函数组件中的状态逻辑",
        "desc": "Hooks 让函数组件可以使用状态、副作用、引用和缓存逻辑。它也是组织 React 业务逻辑的重要方式。",
        "tags": [
          "useState",
          "useEffect",
          "Hooks"
        ]
      },
      {
        "slug": "react-state-render",
        "meta": "状态更新",
        "title": "理解渲染触发",
        "desc": "状态变化会触发组件重新渲染。理解状态更新、批处理和不可变数据，有助于减少意外渲染和状态同步问题。",
        "tags": [
          "State",
          "Render",
          "更新"
        ]
      },
      {
        "slug": "react-router",
        "meta": "路由",
        "title": "React 页面组织",
        "desc": "React Router 通过路由表组织页面入口，并支持嵌套路由、动态参数和布局路由，适合搭建多页面体验的单页应用。",
        "tags": [
          "Router",
          "Outlet",
          "Layout"
        ]
      },
      {
        "slug": "react-performance",
        "meta": "性能优化",
        "title": "减少不必要渲染",
        "desc": "React 性能优化通常围绕 memo、useMemo、useCallback、列表 key 和组件拆分展开，让页面在数据变化时更稳定。",
        "tags": [
          "Memo",
          "Key",
          "优化"
        ]
      },
      {
        "slug": "react-controlled-form",
        "meta": "受控组件",
        "title": "表单由状态驱动",
        "desc": "受控组件把输入框、选择器等表单值交给 React 状态管理。它方便校验、提交和联动，但也需要注意更新频率。",
        "tags": [
          "Form",
          "Input",
          "状态"
        ]
      }
    ]
  }
]

export const allHomeArticles = [
  {
    "slug": "js-debounce",
    "meta": "JS 防抖",
    "title": "认识 JS 防抖",
    "desc": "防抖是一种让频繁触发的操作先安静片刻的处理思路。它常用于搜索输入、窗口缩放、按钮点击等场景，让事件在短时间内多次发生时，只保留最后一次真正需要响应的动作。",
    "tags": [
      "JavaScript",
      "DOM 事件",
      "性能优化"
    ]
  },
  {
    "slug": "js-throttle",
    "meta": "JS 节流",
    "title": "认识 JS 节流",
    "desc": "节流关注的是控制触发频率，让连续发生的事件按照固定节奏响应。它适合滚动监听、拖拽移动、页面尺寸变化等高频场景，让交互保持流畅，也避免函数被过度调用。",
    "tags": [
      "JavaScript",
      "定时器",
      "事件控制"
    ]
  },
  {
    "slug": "virtual-list",
    "meta": "虚拟列表",
    "title": "虚拟列表的思路",
    "desc": "虚拟列表通过只渲染当前可视区域附近的数据，减少大量 DOM 同时存在带来的压力。它常用于长列表、日志面板、数据表格等内容很多但屏幕只能看到一部分的场景。",
    "tags": [
      "React",
      "滚动容器",
      "DOM 优化"
    ]
  },
  {
    "slug": "large-file-upload",
    "meta": "大文件上传",
    "title": "大文件上传概览",
    "desc": "大文件上传通常会围绕切片、并发、断点续传和上传进度展开。它把一个庞大的文件拆成更容易管理的小片段，让上传过程更稳定，也更容易在网络波动后恢复。",
    "tags": [
      "File API",
      "分片上传",
      "断点续传"
    ]
  },
  {
    "slug": "dynamic-breadcrumb",
    "meta": "动态面包屑",
    "title": "动态面包屑目录",
    "desc": "动态面包屑会根据当前路由、菜单配置或页面层级生成导航路径。它能让用户清楚知道自己所在的位置，并快速回到上一级或某个父级页面。",
    "tags": [
      "React Router",
      "路由匹配",
      "菜单配置"
    ]
  },
  {
    "slug": "file-md5",
    "meta": "MD5 计算",
    "title": "文件 MD5 值计算",
    "desc": "MD5 值可以用来标识文件内容，常见于秒传判断、完整性校验和重复文件识别。前端计算 MD5 时通常会结合文件读取、切片处理和进度反馈。",
    "tags": [
      "Hash",
      "Blob",
      "文件校验"
    ]
  },
  {
    "slug": "css-flex",
    "meta": "Flex 布局",
    "title": "弹性布局的核心",
    "desc": "Flex 适合处理一维方向上的排列、对齐和空间分配。它常用于导航栏、按钮组、卡片内部结构和左右分栏，让元素在不同宽度下保持自然伸缩。",
    "tags": [
      "CSS",
      "Flex",
      "布局"
    ]
  },
  {
    "slug": "css-grid",
    "meta": "Grid 布局",
    "title": "二维网格布局",
    "desc": "Grid 更适合同时控制行和列的页面结构。它可以清晰地描述卡片网格、仪表盘、图片墙和复杂内容区，让布局规则更接近页面本身。",
    "tags": [
      "CSS",
      "Grid",
      "响应式"
    ]
  },
  {
    "slug": "css-responsive",
    "meta": "响应式",
    "title": "适配不同屏幕",
    "desc": "响应式设计通过百分比、弹性尺寸、媒体查询和自适应网格，让页面在桌面、平板和手机上都能保持舒服的阅读与操作体验。",
    "tags": [
      "Media Query",
      "移动端",
      "适配"
    ]
  },
  {
    "slug": "css-transition",
    "meta": "过渡动画",
    "title": "让变化更自然",
    "desc": "Transition 用来描述样式变化的过程，让 hover、展开、位移和透明度变化不再生硬。合适的过渡能提升界面的精致感。",
    "tags": [
      "Transition",
      "Hover",
      "交互"
    ]
  },
  {
    "slug": "css-position-zindex",
    "meta": "定位层级",
    "title": "理解定位和层叠",
    "desc": "position 和 z-index 决定元素如何脱离文档流、如何覆盖其他内容。浮层、固定按钮、提示框和背景装饰都离不开这些概念。",
    "tags": [
      "Position",
      "z-index",
      "浮层"
    ]
  },
  {
    "slug": "css-line-clamp",
    "meta": "文本省略",
    "title": "多行文本截断",
    "desc": "文本省略常用于卡片摘要和列表标题。通过行数限制与溢出隐藏，可以让内容长度不确定的模块依然保持整齐。",
    "tags": [
      "Line Clamp",
      "Overflow",
      "摘要"
    ]
  },
  {
    "slug": "js-event-loop",
    "meta": "事件循环",
    "title": "理解异步执行顺序",
    "desc": "事件循环负责协调同步任务、微任务和宏任务。理解它可以帮助判断 Promise、定时器、事件回调之间的执行先后。",
    "tags": [
      "Event Loop",
      "Promise",
      "异步"
    ]
  },
  {
    "slug": "js-closure",
    "meta": "闭包",
    "title": "函数与作用域的关系",
    "desc": "闭包让函数能够记住创建时的作用域。它常出现在封装私有变量、函数工厂、回调和状态保存等场景中。",
    "tags": [
      "Scope",
      "Function",
      "变量"
    ]
  },
  {
    "slug": "js-prototype",
    "meta": "原型链",
    "title": "对象继承的基础",
    "desc": "原型链是 JavaScript 对象查找属性和方法的重要机制。理解它有助于看懂继承、构造函数、class 语法和对象扩展。",
    "tags": [
      "Prototype",
      "Object",
      "继承"
    ]
  },
  {
    "slug": "js-module",
    "meta": "模块化",
    "title": "组织代码边界",
    "desc": "模块化让代码按职责拆分，通过导入导出建立依赖关系。它能降低全局污染，让大型项目更容易维护和协作。",
    "tags": [
      "ESM",
      "Import",
      "Export"
    ]
  },
  {
    "slug": "js-array-methods",
    "meta": "数组方法",
    "title": "常用数据处理",
    "desc": "map、filter、reduce 等数组方法能让数据转换更清晰。它们常用于列表渲染、筛选、统计和接口数据整理。",
    "tags": [
      "Array",
      "Map",
      "Reduce"
    ]
  },
  {
    "slug": "js-error-handling",
    "meta": "错误处理",
    "title": "让异常可控",
    "desc": "错误处理关注代码失败时的兜底方式。try catch、Promise catch 和统一错误提示能让用户体验更加稳定。",
    "tags": [
      "Error",
      "try catch",
      "稳定性"
    ]
  },
  {
    "slug": "vue-reactive",
    "meta": "响应式",
    "title": "数据驱动视图",
    "desc": "Vue 的响应式系统会追踪数据变化，并自动更新依赖这些数据的视图。它让开发者更专注于状态本身，而不是手动操作 DOM。",
    "tags": [
      "Vue",
      "Reactive",
      "状态"
    ]
  },
  {
    "slug": "vue-component-communication",
    "meta": "组件通信",
    "title": "组件之间传递信息",
    "desc": "组件通信用于连接父子组件、兄弟组件和全局状态。props、emit、provide/inject 和状态管理都可以解决不同层级的数据流动。",
    "tags": [
      "Props",
      "Emit",
      "通信"
    ]
  },
  {
    "slug": "vue-composition-api",
    "meta": "组合式 API",
    "title": "按逻辑组织代码",
    "desc": "组合式 API 让状态、计算、监听和方法可以按业务逻辑聚合。复杂组件拆分逻辑时会更清晰，也更方便复用。",
    "tags": [
      "Composition",
      "Setup",
      "复用"
    ]
  },
  {
    "slug": "vue-directive",
    "meta": "指令",
    "title": "模板中的行为表达",
    "desc": "v-if、v-for、v-bind、v-model 等指令让模板具备条件渲染、列表渲染、属性绑定和双向绑定能力。",
    "tags": [
      "Directive",
      "Template",
      "渲染"
    ]
  },
  {
    "slug": "vue-router",
    "meta": "路由",
    "title": "单页应用页面切换",
    "desc": "Vue Router 负责路径和组件的映射。它支持嵌套路由、动态路由、导航守卫和懒加载，是单页应用的基础能力。",
    "tags": [
      "Vue Router",
      "SPA",
      "导航"
    ]
  },
  {
    "slug": "vue-pinia",
    "meta": "Pinia",
    "title": "集中管理共享状态",
    "desc": "Pinia 用于管理跨组件共享的数据。它相比局部状态更适合用户信息、主题配置、权限菜单和缓存数据。",
    "tags": [
      "Pinia",
      "Store",
      "共享状态"
    ]
  },
  {
    "slug": "react-component",
    "meta": "组件思想",
    "title": "把页面拆成模块",
    "desc": "React 鼓励把界面拆成可复用组件。每个组件负责自己的结构、状态和交互，组合起来形成完整页面。",
    "tags": [
      "React",
      "Component",
      "复用"
    ]
  },
  {
    "slug": "react-hooks",
    "meta": "Hooks",
    "title": "函数组件中的状态逻辑",
    "desc": "Hooks 让函数组件可以使用状态、副作用、引用和缓存逻辑。它也是组织 React 业务逻辑的重要方式。",
    "tags": [
      "useState",
      "useEffect",
      "Hooks"
    ]
  },
  {
    "slug": "react-state-render",
    "meta": "状态更新",
    "title": "理解渲染触发",
    "desc": "状态变化会触发组件重新渲染。理解状态更新、批处理和不可变数据，有助于减少意外渲染和状态同步问题。",
    "tags": [
      "State",
      "Render",
      "更新"
    ]
  },
  {
    "slug": "react-router",
    "meta": "路由",
    "title": "React 页面组织",
    "desc": "React Router 通过路由表组织页面入口，并支持嵌套路由、动态参数和布局路由，适合搭建多页面体验的单页应用。",
    "tags": [
      "Router",
      "Outlet",
      "Layout"
    ]
  },
  {
    "slug": "react-performance",
    "meta": "性能优化",
    "title": "减少不必要渲染",
    "desc": "React 性能优化通常围绕 memo、useMemo、useCallback、列表 key 和组件拆分展开，让页面在数据变化时更稳定。",
    "tags": [
      "Memo",
      "Key",
      "优化"
    ]
  },
  {
    "slug": "react-controlled-form",
    "meta": "受控组件",
    "title": "表单由状态驱动",
    "desc": "受控组件把输入框、选择器等表单值交给 React 状态管理。它方便校验、提交和联动，但也需要注意更新频率。",
    "tags": [
      "Form",
      "Input",
      "状态"
    ]
  }
]
