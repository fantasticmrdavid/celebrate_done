import { Collapse, Skeleton } from 'antd'
import React from 'react'

const { Panel } = Collapse

export const CategoryCardSkeleton = () => (
	<div style={{ flex: 1, width: '100%' }}>
		<Collapse
			collapsible={'disabled'}
			defaultActiveKey={0}
			expandIconPosition={'end'}
			size={'small'}
		>
			<Panel
				key={0}
				header={
					<>
						<Skeleton paragraph={false} style={{ width: '100px' }} />
						<Skeleton paragraph={false} active />
					</>
				}
			>
				<Skeleton active />
			</Panel>
		</Collapse>
	</div>
)
