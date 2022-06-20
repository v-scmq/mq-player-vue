/************************** Accordion *******************************/
/**
 * 手风琴子列表项信息
 */
type AccordionDataItem = {
    /** 数据id */
    id: string | number;
    /** 名称 */
    name: string;
};

/**
 * 手风琴主列表项信息
 */
export type AccordionDataGroup = {
    /** 分组id */
    id: string | number;
    /** 分组标题 */
    title: string;
    /** 子列表项数据信息 */
    items: AccordionDataItem[];
}
/*******************************************************************/


/************************** TableView *******************************/

/**
 * 单元格值的getter方法
 */
export type CellValueGetter = (item: TableRow, rowIndex: number, column: TableColumn) => string | number | boolean

/**
 * 表格列信息
 */
export type TableColumn = {
    /** 列标题 */
    title?: string;
    /** 列类型(若指定为 'index', 则单元格的值会通过内部方法生成, 否则必须通过valueGetter指定, 或通过slot重写) */
    type?: 'index';
    /** 列宽,默认为 1fr; 取值参考{@link CSSStyleDeclaration.gridTemplateColumns} */
    width?: string;
    /** 单元格取值属性名称 */
    property?: string;
    /**
     * 单元格是否使用flex布局, 参见src/assets/css/base.css
     * 若为true, 则单元格增加名为flex的class 实现所有直接子元素垂直居中 + 子元素实现文本溢出显示省略号;
     * 若为false, 则单元格使用line-height + height 实现文本垂直居中 和 文本溢出显示省略号.
     */
    flex?: boolean;

    /**
     * 自定义单元格取值方法
     *
     * @param item 表格行数据
     * @param rowIndex 表格行索引
     * @param column 表格列信息
     * @return {string | number | boolean} 单元格值
     */
    valueGetter?: CellValueGetter;
}

/**
 * 表格行单元格数据
 */
export type TableRow = {
    /** 数据取值属性 */
    [key: string]: any
}
/*******************************************************************/


/************************** GridView *******************************/

/**
 * GridVew组件数据项
 */
export type GridDataItem = string | { [key: string]: any };
/*******************************************************************/


/**
 * 选项卡
 */
export type Tab = {
    /* 选项卡上的前置插槽(不能和name属性值相同) */
    slot?: string;
    /* 选项卡标题 */
    title: string;
    /* 选项卡名称, 它将作为class名被添加到tab content根元素上 并且作为slot名称 */
    name: string;

    /* 若是router模式,则必须指定 */
    path?: string;
    /* 图标 */
    icon?: string;

    [key: string]: any;
};

/**
 * 选项卡模式
 */
export type TabMode = "normal" | "router";

/**
 * 选项卡的位置
 */
export type TabPosition = 'top' | 'right' | 'bottom' | 'left';

/**
 * 选项卡的排列方式(水平、垂直)
 */
export type TabAlignment = 'horizontal' | 'vertical';