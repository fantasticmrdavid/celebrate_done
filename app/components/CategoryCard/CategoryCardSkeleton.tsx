import {Collapse, Skeleton} from "antd";
import React from "react";

const { Panel } = Collapse

export const CategoryCardSkeleton = () => (
  <Collapse
    collapsible={'disabled'}
    defaultActiveKey={0}
  >
    <Panel
      key={0}
      header={
        <Skeleton paragraph={false} style={{ width: "300px"}} />
    }>
      <Skeleton active />
    </Panel>
  </Collapse>
)