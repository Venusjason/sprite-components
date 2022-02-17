---
title: vue-hooks
group:
  path: /vue-hooks
nav:
  title: 组件
  path: /components
---

# `@a-sprite/vue-hooks`

* 结合vue3 hooks语法（支持vue2 + composition-api）, `usePaginated` 可以用来替换 `QueryTable` 组件，使用hooks组件可以达到ui层的最大自定义

```
// 安装
npm i @a-sprite/vue-hooks -S

```

## 基础用法
> 简单说明（可选）

```

import {
  defineComponent
} from '@vue/composition-api'

import {
  useRequest,
  setGlobalRequestOption
} from "@a-sprite/vue-hooks";

setGlobalRequestOption({
  manual: false,
})

type Res = { num: string }

const service = (num): Promise<Res> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        num: (num || Math.ceil(Math.random() * 1000)).toString()
      })
    }, 300)
  })
}

export default defineComponent({
  setup() {
    return useRequest<Res>(service)
  },
  render() {
    return (
      <div>
        <el-button type="primary" loading={this.loading} onClick={this.run} >按钮</el-button> {JSON.stringify(this.data, null, 2)}
      </div>
    )
  }
})

```

> 缓存模式， 适用于不频繁更新的数据（如枚举、权限、菜单），缓存有效期内 & 参数不变，多次调用会直接使用缓存结果
requireCode("~packages/w-vue-hooks/examples/useCache.tsx")

```
import {
  defineComponent,
  ref,
  isVue2,
} from 'vue-demi'

import axios from 'axios'

import {
  usePaginated,
  useRequest,
  JsxElTableColumns,
  setGlobalPaginationOption,
  IPageResponse,
  IPagination,
  IElTableColumnItem,
} from "@a-sprite/vue-hooks";

interface Item {
  name: string;
  status: number;
  platform: string;
  price: string;
}

type IResponseItem = {}

setGlobalPaginationOption({
  pageSizes: [10, 15, 20],
  layout: 'sizes, prev, pager, next, jumper, ->, total'
})

const QueryTable = defineComponent({
  setup() {
    const service = async ({ currentPage, pageSize }: IPagination) => {
      const res = await axios.get(
        `https://yapi.weierai.com/mock/360/goods/list?currentPage=${currentPage}&pageSize=${pageSize}`
      );
      return {
        data: res.data.data.list,
        total: 40,
      } as IPageResponse<IResponseItem>;
    };

    const sortType = ref('')

    const setSortType = ({ order }) => {
      sortType.value = order
    }

    const {
      loading,
      data,
      pagination,
      run,
      error
    } = usePaginated<IResponseItem>(service, {
      defaultError: "出错了",
      // 设置防抖  
      debounceInterval: 200,
      // 排序条件变化 会自动触发重置第一页查询
      refreshDeps: () => [sortType.value]
    });
    const columns: IElTableColumnItem<IResponseItem>[] = [
      { prop: "name", label: "名称" },
      { prop: "status", label: "状态", sortable: true },
      { prop: "platform", label: "platform" },
      // {
      //   prop: "price",
      //   label: "价格",
      //   render: ({ row, $index }) => {
      //     return `${$index} : ${row.price}`;
      //   },
      // },
    ];

    return () => {
      const { on, ...attrs } = pagination.value
      const events = {
        onCurrentChange: on['current-change'],
        onSizeChange: on['size-change']
      }
      return <div>
        <pre>vue version {isVue2 ? '2.x' : '3'}</pre>
        <div>
          <el-button onClick={run} type="primary">
            查询
          </el-button>
        </div>
        <el-table data={data.value} on={{'sort-change': setSortType}} SortChange={setSortType} >
          {
            JsxElTableColumns(columns)
          }
        </el-table>
        {
          isVue2 ? <el-pagination attrs={attrs} on={on} /> : <el-pagination {...{...attrs, ...events}}/>
        }
      </div>
    }
  },
});

export default QueryTable

```

## setGlobalPaginationOption

- 设置分页全局参数，属性参考 `el-pagination` 组件

```
import { setGlobalPaginationOption } from '@weier/w-vue-hooks'

setGlobalPaginationOption({
  pageSizes: [10, 15, 20],
  layout: 'sizes, prev, pager, next, jumper, ->, total'
})
```

## JsxElTableColumns

- `el-table-column` 组件的jsx版本

```
import { JsxElTableColumns } from '@weier/w-vue-hooks'

const colunms = [
  { prop: 'name', label: '名称' },
  { prop: 'status', label: '状态' },
  { prop: 'platform', label: 'platform' },
  {
    prop: 'price',
    label: '价格',
    render: ({ row, $index }) => {
      return `${$index} : ${row.price}`
    }
  }
]

<el-table>
  { JsxElTableColumns(colunms) }
</el-table>

```

## useRequest Service
- 只要满足Promise 即可


## useRequest Options: IRequestOption
| 参数 | 说明 | 类型       | 可选值      |  默认值  |
| ---- | ---- | --------- | ---------- | ------- |
| manual | 是否手动调用 | boolean  | —— | false |   
| filterServiceInvalidValue |  自动过滤service中无效入参  | boolean | - |  true  |
| initialData | service 默认返回值 | any  | —— | - |   
| defaultError |  service 默认异常  | any | - |    |
| debounceInterval |  防抖 delay  | number | - |  0  |
| throttleInterval |  节流 delay  | number | - |  0  |


```
export type IService<T> = (...args: any[]) => Promise<T>

export interface IOptions {
  /**
   * 手动调用
   */
  manual?: boolean;
  /**
   * 自动过滤service中无效入参
   */
  filterServiceInvalidValue?: boolean,
  /**
   * data 默认值
   */
  initialData?: any;
  /**
   * 默认错误返回
   */
  defaultError?: string;
  /**
   * 防抖间隔, 单位为毫秒，设置后，请求进入防抖模式
   */
  debounceInterval?: number;
  /**
   * 节流间隔, 单位为毫秒，设置后，请求进入节流模式。
   */
  throttleInterval?: number;
  /**
   * 在 manual = false 时，refreshDeps 变化，会触发 service 重新执行
   * 分页模式下， refreshDeps 变化，会重置 currentPage 到第一页，并重新发起请求，一般你可以把依赖的条件放这里。
   */
  refreshDeps?: WatchSource;
  /**
   * 缓存键 要求必须唯一， 建议用symbol，paginated loadMore 模式下无效
   * 函数service入参变化，缓存也会失效
   */
  cacheKey?: any;
  /**
   * 设置缓存数据回收时间。默认缓存数据 5 分钟后回收
    如果设置为 -1, 则表示缓存数据永不过期
    需要配和 cacheKey 使用
   */
  cacheTime?: number;

  /** 内部调用，请勿使用 */
  loadMore?: boolean;
  /** 内部调用，请勿使用 */
  paginated?: boolean;
}
```
## usePaginated Service

- 只要满足Promise 即可

## usePaginated Service

- 只要满足Promise 即可

## usePaginated Option

- el-pagination api
```

interface IPaginatedOption extends IRequestOption {
  small: boolean;
  background: boolean | string;
  pagerCount: number;
  ['hide-on-single-page']: boolean;
  disabled: boolean;
  pageSize: number;
  pageSizes: number[];
  layout: string;
}

```

## useLoadMore
> `useLoadMore` 适用在列表滚动加载的场景，支持滚动、自动重载

requireCode("~packages/w-vue-hooks/examples/useLoadMore.tsx")

> 上拉自动加载 & 依赖项变更自动重新加载

requireCode("~packages/w-vue-hooks/examples/useLoadMoreRef.tsx")


```ts
/**
 * service 返回值
 */
export type ILoadMoreResponse<ListItem = any> = {
  list: ListItem[];
  total?: number;
  [key: string]: any;
}

export type ILoadMoreOptions = IOptions & {
  /**
   * 容器的 ref，如果存在，则在滚动到底部时，自动触发 loadMore
   */
  ref?: Ref<HTMLElement>;
  /**
   * 判断是否还有更多数据的函数
   */
  isNoMore?: (r: ILoadMoreResponse | undefined) => boolean;
  /**
   * 下拉自动加载，距离底部距离阈值
   */
  threshold?: number;
}

/**
 * 数据源获取
 * 上次返回值作为下次请求的入参
 */
export type ILoadMoreService<T> = (p: ILoadMoreResponse<T> | undefined) => ILoadMoreResponse<T>
```
## TODO
  - fetchKey
## 其他备注（可选）


