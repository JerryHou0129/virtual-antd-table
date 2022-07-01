# virtual-antd-table

# Usage

```typescript
const vComponents = React.useMemo(() => {
  return VList({
    dataSource,
    isViewAll: isViewAllDetails
  })
}, [dataSource, isViewAllDetails])

<Table scroll={{y: 720}}, components={vComponents}>
</Table>
```
