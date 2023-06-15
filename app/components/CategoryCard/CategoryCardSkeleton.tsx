import { Collapse, Skeleton } from 'antd'
import React from 'react'

export const CategoryCardSkeleton = () => (
  <div style={{ flex: 1, width: '100%' }}>
    <Collapse
      collapsible={'disabled'}
      defaultActiveKey={0}
      expandIconPosition={'end'}
      size={'small'}
      items={[
        {
          key: '0',
          label: (
            <>
              <Skeleton paragraph={false} style={{ width: '100px' }} />
              <Skeleton paragraph={false} active />
            </>
          ),
          children: <Skeleton active />,
        },
      ]}
    />
  </div>
)
