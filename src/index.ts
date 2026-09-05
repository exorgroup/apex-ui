/*
 * The component stylesheet, pulled in so the build emits it. Nothing else
 * imported it, so `cssFileName: 'apex-ui'` had nothing to name and
 * exports['./style.css'] pointed at a file that was never produced.
 *
 * In library mode Vite extracts this to dist/apex-ui.css rather than injecting
 * it, so consumers still opt in:
 *
 *   import '@exorgroup/apex-ui/tokens.css';   // or your own token values
 *   import '@exorgroup/apex-ui/style.css';
 *
 * tokens.css is deliberately not imported here. The stylesheet's own header
 * says to load it first or supply the same custom properties yourself, and
 * bundling it would take that choice away.
 */
import './styles/apex-ui.css';

import type { App, Plugin } from 'vue';
import { APEX_UI_OPTIONS } from './core/symbols';
import type { ApexUiOptions } from './types';

import ApexIcon from './components/ApexIcon.vue';
import ApexField from './components/ApexField.vue';
import ApexInput from './components/ApexInput.vue';
import ApexTextarea from './components/ApexTextarea.vue';
import ApexNumber from './components/ApexNumber.vue';
import ApexStepper from './components/ApexStepper.vue';
import ApexSelect from './components/ApexSelect.vue';
import ApexMultiselect from './components/ApexMultiselect.vue';
import ApexCascadeSelect from './components/ApexCascadeSelect.vue';
import ApexDatePicker from './components/ApexDatePicker.vue';
import ApexColorPicker from './components/ApexColorPicker.vue';
import ApexOtp from './components/ApexOtp.vue';
import ApexPassword from './components/ApexPassword.vue';
import ApexTags from './components/ApexTags.vue';
import ApexKnob from './components/ApexKnob.vue';
import ApexListbox from './components/ApexListbox.vue';
import ApexOrderList from './components/ApexOrderList.vue';
import ApexRating from './components/ApexRating.vue';
import ApexSelectButton from './components/ApexSelectButton.vue';
import ApexSlider from './components/ApexSlider.vue';
import ApexToggleButton from './components/ApexToggleButton.vue';
import ApexTreeSelect from './components/ApexTreeSelect.vue';
import ApexCheckbox from './components/ApexCheckbox.vue';
import ApexCheckboxGroup from './components/ApexCheckboxGroup.vue';
import ApexSwitch from './components/ApexSwitch.vue';
import ApexSegmented from './components/ApexSegmented.vue';
import ApexRadio from './components/ApexRadio.vue';
import ApexRadioGroup from './components/ApexRadioGroup.vue';
import ApexButton from './components/ApexButton.vue';
import ApexButtonGroup from './components/ApexButtonGroup.vue';
import ApexSpeedDial from './components/ApexSpeedDial.vue';
import ApexSplitButton from './components/ApexSplitButton.vue';
import ApexDataTable from './components/ApexDataTable.vue';
import ApexPaginator from './components/ApexPaginator.vue';
import ApexDataView from './components/ApexDataView.vue';
import ApexOrgChart from './components/ApexOrgChart.vue';
import ApexPickList from './components/ApexPickList.vue';
import ApexTimeline from './components/ApexTimeline.vue';
import ApexTree from './components/ApexTree.vue';
import ApexTreeTable from './components/ApexTreeTable.vue';
import ApexAccordion from './components/ApexAccordion.vue';
import ApexAvatar from './components/ApexAvatar.vue';
import ApexAvatarGroup from './components/ApexAvatarGroup.vue';
import ApexBadge from './components/ApexBadge.vue';
import ApexBlockUI from './components/ApexBlockUI.vue';
import ApexChip from './components/ApexChip.vue';
import ApexInplace from './components/ApexInplace.vue';
import ApexMeterGroup from './components/ApexMeterGroup.vue';
import ApexOverlayBadge from './components/ApexOverlayBadge.vue';
import ApexCard from './components/ApexCard.vue';
import ApexFieldset from './components/ApexFieldset.vue';
import ApexPanel from './components/ApexPanel.vue';
import ApexScrollArea from './components/ApexScrollArea.vue';
import ApexSplitter from './components/ApexSplitter.vue';
import ApexSteps from './components/ApexSteps.vue';
import ApexTabs from './components/ApexTabs.vue';
import ApexToolbar from './components/ApexToolbar.vue';
import ApexDialog from './components/ApexDialog.vue';
import ApexConfirmDialog from './components/ApexConfirmDialog.vue';
import ApexAlert from './components/ApexAlert.vue';
import ApexConfirmPopup from './components/ApexConfirmPopup.vue';
import ApexDrawer from './components/ApexDrawer.vue';
import ApexDynamicDialog from './components/ApexDynamicDialog.vue';
import ApexPopover from './components/ApexPopover.vue';
import ApexFileUpload from './components/ApexFileUpload.vue';
import ApexBreadcrumb from './components/ApexBreadcrumb.vue';
import ApexContextMenu from './components/ApexContextMenu.vue';
import ApexDock from './components/ApexDock.vue';
import ApexMegaMenu from './components/ApexMegaMenu.vue';
import ApexMenu from './components/ApexMenu.vue';
import ApexMenubar from './components/ApexMenubar.vue';
import ApexTieredMenu from './components/ApexTieredMenu.vue';
import ApexMessage from './components/ApexMessage.vue';
import ApexToast from './components/ApexToast.vue';
import ApexCarousel from './components/ApexCarousel.vue';
import ApexCarouselContent from './components/ApexCarouselContent.vue';
import ApexCarouselItem from './components/ApexCarouselItem.vue';
import ApexCarouselNav from './components/ApexCarouselNav.vue';
import ApexCarouselControls from './components/ApexCarouselControls.vue';
import ApexCarouselIndicators from './components/ApexCarouselIndicators.vue';
import ApexCompare from './components/ApexCompare.vue';
import ApexGallery from './components/ApexGallery.vue';
import ApexCompareItem from './components/ApexCompareItem.vue';
import ApexSidebar from './components/ApexSidebar.vue';
import ApexSidebarLayout from './components/ApexSidebarLayout.vue';
import ApexSidebarInset from './components/ApexSidebarInset.vue';
import ApexSidebarTrigger from './components/ApexSidebarTrigger.vue';
import { apexTooltip } from './core/tooltip';
import { apexAnimateOnScroll } from './core/animateOnScroll';
import { apexFocusTrap } from './core/focusTrap';
import { apexRipple } from './core/ripple';
import { apexStyleClass } from './core/styleClass';
import ApexProgressBar from './components/ApexProgressBar.vue';
import ApexProgressSpinner from './components/ApexProgressSpinner.vue';
import ApexScrollTop from './components/ApexScrollTop.vue';
import ApexSkeleton from './components/ApexSkeleton.vue';
import ApexChart from './components/ApexChart.vue';
import ApexChartGroup from './components/ApexChartGroup.vue';
import {
  ApexChartSeries, ApexChartXAxis, ApexChartYAxis, ApexChartY2Axis, ApexChartLegend,
  ApexChartTooltip, ApexChartHover, ApexChartDataLabels, ApexChartZoom, ApexChartNavigator,
  ApexChartReferenceLine, ApexChartReferenceBand, ApexChartTitle, ApexChartCaption,
} from './core/chart/parts';
import ApexTaskBoard from './components/ApexTaskBoard.vue';
import ApexTaskCard from './components/ApexTaskCard.vue';
import ApexColumnFilter from './components/ApexColumnFilter.vue';
import ApexErrorSummary from './components/ApexErrorSummary.vue';

export const components = {
  Icon: ApexIcon,
  Field: ApexField,
  Input: ApexInput,
  Textarea: ApexTextarea,
  Number: ApexNumber,
  Stepper: ApexStepper,
  Select: ApexSelect,
  Multiselect: ApexMultiselect,
  CascadeSelect: ApexCascadeSelect,
  DatePicker: ApexDatePicker,
  ColorPicker: ApexColorPicker,
  Otp: ApexOtp,
  Password: ApexPassword,
  Tags: ApexTags,
  Knob: ApexKnob,
  Listbox: ApexListbox,
  OrderList: ApexOrderList,
  Rating: ApexRating,
  SelectButton: ApexSelectButton,
  Slider: ApexSlider,
  ToggleButton: ApexToggleButton,
  TreeSelect: ApexTreeSelect,
  Checkbox: ApexCheckbox,
  CheckboxGroup: ApexCheckboxGroup,
  Switch: ApexSwitch,
  Segmented: ApexSegmented,
  Radio: ApexRadio,
  RadioGroup: ApexRadioGroup,
  Button: ApexButton,
  ButtonGroup: ApexButtonGroup,
  SpeedDial: ApexSpeedDial,
  SplitButton: ApexSplitButton,
  DataTable: ApexDataTable,
  Paginator: ApexPaginator,
  DataView: ApexDataView,
  OrgChart: ApexOrgChart,
  PickList: ApexPickList,
  Timeline: ApexTimeline,
  Tree: ApexTree,
  TreeTable: ApexTreeTable,
  Accordion: ApexAccordion,
  Avatar: ApexAvatar,
  AvatarGroup: ApexAvatarGroup,
  Badge: ApexBadge,
  BlockUI: ApexBlockUI,
  Chip: ApexChip,
  Inplace: ApexInplace,
  MeterGroup: ApexMeterGroup,
  OverlayBadge: ApexOverlayBadge,
  Card: ApexCard,
  Fieldset: ApexFieldset,
  Panel: ApexPanel,
  ScrollArea: ApexScrollArea,
  Splitter: ApexSplitter,
  Steps: ApexSteps,
  Tabs: ApexTabs,
  Toolbar: ApexToolbar,
  Dialog: ApexDialog,
  ConfirmDialog: ApexConfirmDialog,
  Alert: ApexAlert,
  ConfirmPopup: ApexConfirmPopup,
  Drawer: ApexDrawer,
  DynamicDialog: ApexDynamicDialog,
  Popover: ApexPopover,
  FileUpload: ApexFileUpload,
  Breadcrumb: ApexBreadcrumb,
  ContextMenu: ApexContextMenu,
  Dock: ApexDock,
  MegaMenu: ApexMegaMenu,
  Menu: ApexMenu,
  Menubar: ApexMenubar,
  TieredMenu: ApexTieredMenu,
  Message: ApexMessage,
  Toast: ApexToast,
  Carousel: ApexCarousel,
  CarouselContent: ApexCarouselContent,
  CarouselItem: ApexCarouselItem,
  CarouselNav: ApexCarouselNav,
  CarouselControls: ApexCarouselControls,
  CarouselIndicators: ApexCarouselIndicators,
  Compare: ApexCompare,
  Gallery: ApexGallery,
  CompareItem: ApexCompareItem,
  Sidebar: ApexSidebar,
  SidebarLayout: ApexSidebarLayout,
  SidebarInset: ApexSidebarInset,
  SidebarTrigger: ApexSidebarTrigger,
  ProgressBar: ApexProgressBar,
  ProgressSpinner: ApexProgressSpinner,
  ScrollTop: ApexScrollTop,
  Skeleton: ApexSkeleton,
  Chart: ApexChart,
  ChartGroup: ApexChartGroup,
  ChartSeries: ApexChartSeries,
  ChartXAxis: ApexChartXAxis,
  ChartYAxis: ApexChartYAxis,
  ChartY2Axis: ApexChartY2Axis,
  ChartLegend: ApexChartLegend,
  ChartTooltip: ApexChartTooltip,
  ChartHover: ApexChartHover,
  ChartDataLabels: ApexChartDataLabels,
  ChartZoom: ApexChartZoom,
  ChartNavigator: ApexChartNavigator,
  ChartReferenceLine: ApexChartReferenceLine,
  ChartReferenceBand: ApexChartReferenceBand,
  ChartTitle: ApexChartTitle,
  ChartCaption: ApexChartCaption,
  TaskBoard: ApexTaskBoard,
  TaskCard: ApexTaskCard,
  ColumnFilter: ApexColumnFilter,
  ErrorSummary: ApexErrorSummary,
};

/**
 * app.use(ApexUI, { size: 'md', labelPlacement: 'top' })
 * Registers <ApexInput>, <ApexSelect>, … (prefix configurable).
 */
export const ApexUI: Plugin = {
  install(app: App, options: ApexUiOptions = {}) {
    const prefix = options.prefix ?? 'Apex';
    app.provide(APEX_UI_OPTIONS, options);
    Object.entries(components).forEach(([name, c]) => app.component(prefix + name, c));
    /* Directives follow the same prefix as the components: v-apex-tooltip. */
    const dp = prefix.charAt(0).toLowerCase() + prefix.slice(1);
    app.directive(dp + 'Tooltip', apexTooltip);
    app.directive(dp + 'AnimateOnScroll', apexAnimateOnScroll);
    app.directive(dp + 'FocusTrap', apexFocusTrap);
    app.directive(dp + 'Ripple', apexRipple);
    app.directive(dp + 'StyleClass', apexStyleClass);
  },
};

export default ApexUI;
export {
  ApexIcon, ApexField, ApexInput, ApexTextarea, ApexNumber, ApexStepper,
  ApexSelect, ApexMultiselect, ApexCascadeSelect, ApexDatePicker, ApexColorPicker, ApexOtp, ApexPassword, ApexTags, ApexKnob, ApexListbox, ApexOrderList, ApexRating, ApexSelectButton, ApexSlider, ApexToggleButton, ApexTreeSelect, ApexCheckbox, ApexCheckboxGroup, ApexSwitch, ApexSegmented, ApexRadio, ApexRadioGroup,
  ApexDrawer, ApexDynamicDialog, ApexPopover, ApexFileUpload, ApexBreadcrumb, ApexContextMenu, ApexDock, ApexMegaMenu, ApexMenu, ApexMenubar, ApexTieredMenu, ApexMessage, ApexToast, ApexCarousel, ApexCarouselContent, ApexCarouselItem,
  ApexCarouselNav, ApexCarouselControls, ApexCarouselIndicators,
  ApexCompare, ApexCompareItem, ApexGallery, ApexSidebar, ApexSidebarLayout, ApexSidebarInset, ApexSidebarTrigger,
  ApexButton, ApexButtonGroup, ApexSpeedDial, ApexSplitButton, ApexDataTable, ApexPaginator, ApexDataView, ApexOrgChart, ApexPickList, ApexTimeline, ApexTree, ApexTreeTable, ApexAccordion, ApexAvatar, ApexBadge, ApexOverlayBadge, ApexBlockUI, ApexChip, ApexInplace, ApexMeterGroup, ApexProgressSpinner, ApexScrollTop, ApexSkeleton, ApexChart, ApexChartGroup, ApexTaskBoard, ApexTaskCard, ApexAvatarGroup, ApexCard, ApexFieldset, ApexPanel, ApexScrollArea, ApexSplitter, ApexSteps, ApexTabs, ApexToolbar, ApexDialog, ApexConfirmDialog, ApexConfirmPopup, ApexAlert, ApexProgressBar, ApexColumnFilter, ApexErrorSummary,
};
export { useFieldState, nextId } from './core/useFieldState';
export { evalCondition, getPath } from './core/conditions';
export { normaliseOptions, slugify, applyTransform } from './core/utils';
export { formatDate, parseDate, formatTime, monthGrid, EN_LOCALE } from './core/dates';
export { ApexColor } from './core/color';
export { keyFilterAccepts, resolveKeyFilter, guardKeydown, guardPaste } from './core/keyFilter';
export type { KeyFilter, KeyFilterPreset } from './core/keyFilter';
export type { TreeNode } from './components/ApexTreeNode';
export type { OrgNode } from './components/ApexOrgNode.vue';
export {
  flattenTree, filterTree, cascadeChecks, setBranchChecked, moveNode, allLeafKeys, branchKeys,
  sortTree, filterTreeRows, aggregateTree, rowOf, removeNode,
} from './core/tree';
export type { TreeNode as ApexTreeNode, FlatNode, CheckState } from './core/tree';
export type { TreeColumn } from './components/ApexTreeTable.vue';
export type { AccordionPanel } from './components/ApexAccordion.vue';
export type { AvatarPerson } from './components/ApexAvatarGroup.vue';
export type { BadgeSeverity } from './components/ApexBadge.vue';
export type { ChipSeverity } from './components/ApexChip.vue';
export type { MeterItem } from './components/ApexMeterGroup.vue';
export type { SplitterPanel } from './components/ApexSplitter.vue';
export type { StepsStep } from './components/ApexSteps.vue';
export type { TabItem } from './components/ApexTabs.vue';
export type { DialogPosition } from './components/ApexDialog.vue';
export type { UploadFile } from './components/ApexFileUpload.vue';
export type { MegaItem, MegaColumn, MegaLink, MegaPanel } from './components/ApexMegaMenu.vue';
export type { MessageSeverity } from './components/ApexMessage.vue';
export type { ToastPosition } from './components/ApexToast.vue';
export type { CarouselCtx } from './core/carousel';
export type { GalleryImage, GalleryAction } from './components/ApexGallery.vue';
export { useApexToast } from './core/toast';
export { useApexTaskBoard, applyMove, groupItems, canMove, cellKey } from './core/taskboard';
export { createScale, measureText, numberTicks, timeTicks, logTicks } from './core/chart/scale';
export type { AxisSpec, Scale, ScaleType, Tick } from './core/chart/scale';
export { resolveSeries, extentOf, xExtentOf, lttb, findHit, snapshot, applyFrame, applyStacking } from './core/chart/data';
export type { ChartSeries, ChartPoint, ResolvedSeries, HitMode, HitSnap, HitResult, ChartGradient, MarkerShape, SegmentContext, StackMode } from './core/chart/data';
export { computeLayout, linePath, areaPath, runPath, curveCommands, segmentPieces, markerPath, placeLabels, gradientCoords, seriesColor } from './core/chart/layout';
export type { CurveType, Rect, PlotPoint, SegmentPiece, LabelCandidate } from './core/chart/layout';
export { exportSvg, exportRaster, exportCsv, exportRows } from './core/chart/export';
export { createChartGroup, CHART_GROUP_KEY, clampRange, zoomAbout, panBy, isFullyZoomedOut } from './core/chart/viewport';
export type { ChartGroup, ChartGroupState, ZoomRange } from './core/chart/viewport';
export { watermarkPlugin, trendlinePlugin, statsPlugin, thresholdPlugin } from './core/chart/plugins';
export {
  arcPath, pieLayout, polar, radarPath, spokeAngles, gaugeGeometry, angleAt, sliceAt, TAU,
} from './core/chart/radial';
export type { PieSlice, RadialFrame, GaugeGeometry } from './core/chart/radial';
export { barSlots, barPath, bubbleRadius } from './core/chart/layout';
export type { BarSlot } from './core/chart/layout';
export { applyWaterfall } from './core/chart/data';
export {
  heatGrid, heatIntensity, heatBand, candleGeometry, treemapLayout,
} from './core/chart/special';
export type { HeatCell, HeatGrid, Candle, CandleGeometry, TreeNode, TreeTile } from './core/chart/special';
export {
  ApexChartSeries, ApexChartXAxis, ApexChartYAxis, ApexChartY2Axis, ApexChartLegend,
  ApexChartTooltip, ApexChartHover, ApexChartDataLabels, ApexChartZoom, ApexChartNavigator,
  ApexChartReferenceLine, ApexChartReferenceBand, ApexChartTitle, ApexChartCaption,
} from './core/chart/parts';
export {
  createChartRegistry, provideChartRegistry, useChartPart, partList, partOne, CHART_REGISTRY_KEY,
} from './core/chart/registry';
export type { ChartRegistry, ChartPartKind } from './core/chart/registry';
export type { BarContext } from './core/chart/data';
export type { ChartPlugin, PluginApi, OverlayNode } from './core/chart/plugins';
export type {
  TaskBoardColumn, TaskBoardSwimlane, TaskBoardItem, TaskBoardCell, TaskBoardMove, TaskCardFields,
} from './core/taskboard';
export type { ToastMessage } from './core/toast';
export { useApexConfirm } from './core/confirm';
export { useApexDialog } from './core/dialog';
export { useApexSidebar } from './core/sidebar';
export type { SidebarState } from './core/sidebar';
export { apexTooltip, ApexTooltipPlugin } from './core/tooltip';
export { apexAnimateOnScroll, ApexAnimateOnScrollPlugin } from './core/animateOnScroll';
export { apexFocusTrap, ApexFocusTrapPlugin } from './core/focusTrap';
export { apexRipple, ApexRipplePlugin } from './core/ripple';
export { apexStyleClass, ApexStyleClassPlugin } from './core/styleClass';
export type { StyleClassOptions } from './core/styleClass';
export type { RippleOptions } from './core/ripple';
export type { FocusTrapOptions } from './core/focusTrap';
export type { AnimateOnScrollOptions } from './core/animateOnScroll';
export type { TooltipOptions } from './core/tooltip';
export type { DynamicDialogOptions, DynamicDialogInstance, DynamicDialogHandle } from './core/dialog';
export { anchorPosition, resolveTarget } from './core/anchor';
export type { AnchorSide, AnchorAlign } from './core/anchor';
export type { ConfirmOptions, ConfirmButton } from './core/confirm';
export type { ColorFormat, Channel } from './core/color';
export type { ApexDateLocale } from './core/dates';
export { useApexI18n, APEX_FALLBACK_STRINGS } from './core/i18n';
export { useApexAlert, setAlertInterpreter } from './core/alert';
export type {
  AlertTone, AlertStage, AlertChange, AlertOptions,
  AlertRunResult, AlertRunOptions,
} from './core/alert';
/* Exported so an app can ask the same question its controls are asking, with
   the same precedence, rather than reimplementing the rule beside them. */
export { useCan } from './core/can';
export { APEX_UI_OPTIONS, APEX_ADAPTER } from './core/symbols';
export { zodAdapter } from './adapters/zod';
export { precognitionAdapter } from './adapters/precognition';
export type { ApexSeverity, ApexButtonVariant } from './components/ApexButton.vue';
export { itemOffset, tooltipSide } from './core/speedDial';
export type { SpeedDialItem, SpeedDialType, SpeedDialDirection } from './core/speedDial';
export type { MenuItem } from './components/ApexMenuItem';
export {
  getField, setField, cellValue, evalFormula, sortRows, filterRows, matches,
  aggregate, groupRows, formatCell, nextOrder,
} from './core/table';
export type {
  ColumnDef, SortMeta, SortOrder, FilterModel, FilterMeta, FilterMatchMode,
  AggregateFn, RowGroup,
} from './core/table';
export type * from './types';
