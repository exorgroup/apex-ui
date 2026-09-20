import './styles/apex-ui.css';
import type { Plugin } from 'vue';
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
import ApexForm from './components/ApexForm.vue';
import ApexEditor from './components/ApexEditor.vue';
import ApexHTMLEditor from './components/ApexHTMLEditor.vue';
import ApexEditorToolbar from './components/ApexEditorToolbar.vue';
import ApexEditorMenubar from './components/ApexEditorMenubar.vue';
import ApexEditorBubble from './components/ApexEditorBubble.vue';
import ApexEditorTableGrid from './components/ApexEditorTableGrid.vue';
import ApexEditorImage from './components/ApexEditorImage.vue';
import ApexEditorLink from './components/ApexEditorLink.vue';
import ApexEditorTableTools from './components/ApexEditorTableTools.vue';
import ApexEditorObjectBar from './components/ApexEditorObjectBar.vue';
import ApexEditorImageTools from './components/ApexEditorImageTools.vue';
import ApexEditorWordCount from './components/ApexEditorWordCount.vue';
import ApexEditorSlash from './components/ApexEditorSlash.vue';
import ApexScheduler from './components/ApexScheduler.vue';
import ApexCalendar from './components/ApexCalendar.vue';
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
import ApexAlert from './components/ApexAlert.vue';
import ApexConfirmPopup from './components/ApexConfirmPopup.vue';
import ApexDrawer from './components/ApexDrawer.vue';
import ApexDynamicDialog from './components/ApexDynamicDialog.vue';
import ApexPopover from './components/ApexPopover.vue';
import ApexFileUpload from './components/ApexFileUpload.vue';
import ApexImageCrop from './components/ApexImageCrop.vue';
import ApexImageField from './components/ApexImageField.vue';
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
import ApexProgressBar from './components/ApexProgressBar.vue';
import ApexProgressSpinner from './components/ApexProgressSpinner.vue';
import ApexScrollTop from './components/ApexScrollTop.vue';
import ApexSkeleton from './components/ApexSkeleton.vue';
import ApexChart from './components/ApexChart.vue';
import ApexChartGroup from './components/ApexChartGroup.vue';
import ApexTaskBoard from './components/ApexTaskBoard.vue';
import ApexTaskCard from './components/ApexTaskCard.vue';
import ApexColumnFilter from './components/ApexColumnFilter.vue';
import ApexErrorSummary from './components/ApexErrorSummary.vue';
export declare const components: {
    Icon: import("vue").DefineComponent<{
        name: string;
        size?: number | string;
        weight?: number;
        fill?: boolean;
        spin?: boolean;
        label?: string;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{
        name: string;
        size?: number | string;
        weight?: number;
        fill?: boolean;
        spin?: boolean;
        label?: string;
    }> & Readonly<{}>, {
        fill: boolean;
        spin: boolean;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Field: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            value?: unknown;
            labelFor?: boolean;
            filled?: boolean;
            focused?: boolean;
        }> & Readonly<{}>, {
            state: {
                id: import("vue").ComputedRef<string>;
                tone: import("vue").ComputedRef<import("./types").ApexTone>;
                message: import("vue").ComputedRef<string | undefined>;
                size: import("vue").ComputedRef<import("./types").ApexSize>;
                labelPlacement: import("vue").ComputedRef<import("./types").ApexLabelPlacement>;
                invalid: import("vue").ComputedRef<boolean>;
                describedBy: import("vue").ComputedRef<string | undefined>;
                focused: import("vue").Ref<boolean, boolean>;
                ruleClass: import("vue").ComputedRef<string | undefined>;
                matched: import("vue").ComputedRef<import("./types").ApexRule | undefined>;
            };
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            statusIcon: boolean;
            labelFor: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            value?: unknown;
            labelFor?: boolean;
            filled?: boolean;
            focused?: boolean;
        }> & Readonly<{}>, {
            state: {
                id: import("vue").ComputedRef<string>;
                tone: import("vue").ComputedRef<import("./types").ApexTone>;
                message: import("vue").ComputedRef<string | undefined>;
                size: import("vue").ComputedRef<import("./types").ApexSize>;
                labelPlacement: import("vue").ComputedRef<import("./types").ApexLabelPlacement>;
                invalid: import("vue").ComputedRef<boolean>;
                describedBy: import("vue").ComputedRef<string | undefined>;
                focused: import("vue").Ref<boolean, boolean>;
                ruleClass: import("vue").ComputedRef<string | undefined>;
                matched: import("vue").ComputedRef<import("./types").ApexRule | undefined>;
            };
        }, {}, {}, {}, {
            statusIcon: boolean;
            labelFor: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        value?: unknown;
        labelFor?: boolean;
        filled?: boolean;
        focused?: boolean;
    }> & Readonly<{}>, {
        state: {
            id: import("vue").ComputedRef<string>;
            tone: import("vue").ComputedRef<import("./types").ApexTone>;
            message: import("vue").ComputedRef<string | undefined>;
            size: import("vue").ComputedRef<import("./types").ApexSize>;
            labelPlacement: import("vue").ComputedRef<import("./types").ApexLabelPlacement>;
            invalid: import("vue").ComputedRef<boolean>;
            describedBy: import("vue").ComputedRef<string | undefined>;
            focused: import("vue").Ref<boolean, boolean>;
            ruleClass: import("vue").ComputedRef<string | undefined>;
            matched: import("vue").ComputedRef<import("./types").ApexRule | undefined>;
        };
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        statusIcon: boolean;
        labelFor: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {
                id: string;
                describedBy: string | undefined;
                tone: import("./types").ApexTone;
                invalid: boolean;
                size: import("./types").ApexSize;
                disabled: boolean;
                statusGlyph: string;
                labelId: string | undefined;
                ui: import("./types").ApexFieldClasses;
            }) => any;
        };
    });
    Input: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: string | number | null;
            type?: "text" | "email" | "tel" | "url" | "search" | "password" | "slug";
            placeholder?: string;
            prefix?: string;
            suffix?: string;
            leadingIcon?: string;
            trailingIcon?: string;
            trailingAction?: import("./types").ApexTrailingAction;
            clearable?: boolean;
            loading?: boolean;
            mono?: boolean;
            transform?: "lower" | "upper" | "slug" | "trim";
            maxlength?: number;
            autocomplete?: string;
            keyFilter?: import(".").KeyFilter;
            suggestions?: import("./types").ApexOptionsInput;
            minLength?: number;
            delay?: number;
            completeOnFocus?: boolean;
            dropdown?: boolean;
            forceSelection?: boolean;
            emptyMessage?: string;
        }> & Readonly<{
            onBlur?: ((v: string) => any) | undefined;
            onChange?: ((v: string) => any) | undefined;
            onFocus?: ((v: string) => any) | undefined;
            "onUpdate:modelValue"?: ((v: string) => any) | undefined;
            onClear?: (() => any) | undefined;
            onAction?: (() => any) | undefined;
            onComplete?: ((payload: {
                query: string;
            }) => any) | undefined;
            "onItem-select"?: ((option: import("./types").ApexOption<unknown>) => any) | undefined;
        }>, {
            focus: () => void | undefined;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:modelValue": (v: string) => void;
            blur: (v: string) => void;
            change: (v: string) => void;
            focus: (v: string) => void;
            clear: () => void;
            action: () => void;
            complete: (payload: {
                query: string;
            }) => void;
            "item-select": (option: import("./types").ApexOption<unknown>) => void;
        }, import("vue").PublicProps, {
            type: "text" | "email" | "tel" | "url" | "search" | "password" | "slug";
            statusIcon: boolean;
            minLength: number;
            delay: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: string | number | null;
            type?: "text" | "email" | "tel" | "url" | "search" | "password" | "slug";
            placeholder?: string;
            prefix?: string;
            suffix?: string;
            leadingIcon?: string;
            trailingIcon?: string;
            trailingAction?: import("./types").ApexTrailingAction;
            clearable?: boolean;
            loading?: boolean;
            mono?: boolean;
            transform?: "lower" | "upper" | "slug" | "trim";
            maxlength?: number;
            autocomplete?: string;
            keyFilter?: import(".").KeyFilter;
            suggestions?: import("./types").ApexOptionsInput;
            minLength?: number;
            delay?: number;
            completeOnFocus?: boolean;
            dropdown?: boolean;
            forceSelection?: boolean;
            emptyMessage?: string;
        }> & Readonly<{
            onBlur?: ((v: string) => any) | undefined;
            onChange?: ((v: string) => any) | undefined;
            onFocus?: ((v: string) => any) | undefined;
            "onUpdate:modelValue"?: ((v: string) => any) | undefined;
            onClear?: (() => any) | undefined;
            onAction?: (() => any) | undefined;
            onComplete?: ((payload: {
                query: string;
            }) => any) | undefined;
            "onItem-select"?: ((option: import("./types").ApexOption<unknown>) => any) | undefined;
        }>, {
            focus: () => void | undefined;
        }, {}, {}, {}, {
            type: "text" | "email" | "tel" | "url" | "search" | "password" | "slug";
            statusIcon: boolean;
            minLength: number;
            delay: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: string | number | null;
        type?: "text" | "email" | "tel" | "url" | "search" | "password" | "slug";
        placeholder?: string;
        prefix?: string;
        suffix?: string;
        leadingIcon?: string;
        trailingIcon?: string;
        trailingAction?: import("./types").ApexTrailingAction;
        clearable?: boolean;
        loading?: boolean;
        mono?: boolean;
        transform?: "lower" | "upper" | "slug" | "trim";
        maxlength?: number;
        autocomplete?: string;
        keyFilter?: import(".").KeyFilter;
        suggestions?: import("./types").ApexOptionsInput;
        minLength?: number;
        delay?: number;
        completeOnFocus?: boolean;
        dropdown?: boolean;
        forceSelection?: boolean;
        emptyMessage?: string;
    }> & Readonly<{
        onBlur?: ((v: string) => any) | undefined;
        onChange?: ((v: string) => any) | undefined;
        onFocus?: ((v: string) => any) | undefined;
        "onUpdate:modelValue"?: ((v: string) => any) | undefined;
        onClear?: (() => any) | undefined;
        onAction?: (() => any) | undefined;
        onComplete?: ((payload: {
            query: string;
        }) => any) | undefined;
        "onItem-select"?: ((option: import("./types").ApexOption<unknown>) => any) | undefined;
    }>, {
        focus: () => void | undefined;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (v: string) => void;
        blur: (v: string) => void;
        change: (v: string) => void;
        focus: (v: string) => void;
        clear: () => void;
        action: () => void;
        complete: (payload: {
            query: string;
        }) => void;
        "item-select": (option: import("./types").ApexOption<unknown>) => void;
    }, string, {
        type: "text" | "email" | "tel" | "url" | "search" | "password" | "slug";
        statusIcon: boolean;
        minLength: number;
        delay: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            leading?: (props: {}) => any;
        } & {
            trailing?: (props: {}) => any;
        } & {
            option?: (props: {
                option: import("./types").ApexOption<unknown>;
            }) => any;
        };
    });
    Textarea: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: string | null;
        placeholder?: string;
        rows?: number;
        maxlength?: number;
        counter?: boolean;
        autogrow?: boolean;
        mono?: boolean;
        keyFilter?: import(".").KeyFilter;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (v: string) => void;
        blur: () => void;
        focus: () => void;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: string | null;
        placeholder?: string;
        rows?: number;
        maxlength?: number;
        counter?: boolean;
        autogrow?: boolean;
        mono?: boolean;
        keyFilter?: import(".").KeyFilter;
    }> & Readonly<{
        onBlur?: (() => any) | undefined;
        onFocus?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: string) => any) | undefined;
    }>, {
        statusIcon: boolean;
        rows: number;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Number: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: number | string | null;
        placeholder?: string;
        min?: number;
        max?: number;
        step?: number;
        unit?: string;
        currency?: string;
        precision?: number;
        clamp?: boolean;
        align?: "start" | "center" | "end";
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (v: number | null) => void;
        blur: () => void;
        focus: () => void;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: number | string | null;
        placeholder?: string;
        min?: number;
        max?: number;
        step?: number;
        unit?: string;
        currency?: string;
        precision?: number;
        clamp?: boolean;
        align?: "start" | "center" | "end";
    }> & Readonly<{
        onBlur?: (() => any) | undefined;
        onFocus?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: number | null) => any) | undefined;
    }>, {
        statusIcon: boolean;
        clamp: boolean;
        align: "start" | "center" | "end";
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Stepper: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: number | null;
        min?: number;
        max?: number;
        step?: number;
        unit?: string;
        decrementIcon?: string;
        incrementIcon?: string;
        decrementText?: string;
        incrementText?: string;
        align?: "start" | "center" | "end";
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "update:modelValue": (v: number) => any;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: number | null;
        min?: number;
        max?: number;
        step?: number;
        unit?: string;
        decrementIcon?: string;
        incrementIcon?: string;
        decrementText?: string;
        incrementText?: string;
        align?: "start" | "center" | "end";
    }> & Readonly<{
        "onUpdate:modelValue"?: ((v: number) => any) | undefined;
    }>, {
        statusIcon: boolean;
        step: number;
        align: "start" | "center" | "end";
        decrementIcon: string;
        incrementIcon: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Select: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: string | number | null;
        options?: import("./types").ApexOptionsInput;
        placeholder?: string;
        leadingIcon?: string;
        clearable?: boolean;
        loading?: boolean;
        native?: boolean;
        filter?: boolean;
        filterPlaceholder?: string;
        filterThreshold?: number;
        addNew?: boolean;
        addNewLabel?: string;
        resource?: string;
        canAddNew?: boolean;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: () => any;
        "update:modelValue": (v: string | number | null) => any;
        "add-new": (payload: {
            query: string;
        }) => any;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: string | number | null;
        options?: import("./types").ApexOptionsInput;
        placeholder?: string;
        leadingIcon?: string;
        clearable?: boolean;
        loading?: boolean;
        native?: boolean;
        filter?: boolean;
        filterPlaceholder?: string;
        filterThreshold?: number;
        addNew?: boolean;
        addNewLabel?: string;
        resource?: string;
        canAddNew?: boolean;
    }> & Readonly<{
        onChange?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: string | number | null) => any) | undefined;
        "onAdd-new"?: ((payload: {
            query: string;
        }) => any) | undefined;
    }>, {
        statusIcon: boolean;
        canAddNew: boolean;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Multiselect: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: unknown[];
        options?: import("./types").ApexOptionsInput;
        placeholder?: string;
        leadingIcon?: string;
        clearable?: boolean;
        loading?: boolean;
        max?: number;
        maxChips?: number;
        filter?: boolean;
        filterPlaceholder?: string;
        filterThreshold?: number;
        toggleAll?: boolean;
        addNew?: boolean;
        addNewLabel?: string;
        resource?: string;
        canAddNew?: boolean;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: () => any;
        "update:modelValue": (v: unknown[]) => any;
        "add-new": (payload: {
            query: string;
        }) => any;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: unknown[];
        options?: import("./types").ApexOptionsInput;
        placeholder?: string;
        leadingIcon?: string;
        clearable?: boolean;
        loading?: boolean;
        max?: number;
        maxChips?: number;
        filter?: boolean;
        filterPlaceholder?: string;
        filterThreshold?: number;
        toggleAll?: boolean;
        addNew?: boolean;
        addNewLabel?: string;
        resource?: string;
        canAddNew?: boolean;
    }> & Readonly<{
        onChange?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: unknown[]) => any) | undefined;
        "onAdd-new"?: ((payload: {
            query: string;
        }) => any) | undefined;
    }>, {
        statusIcon: boolean;
        canAddNew: boolean;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    CascadeSelect: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: unknown;
        options?: import("./components/ApexCascadeSelect.vue").CascadeOption[];
        placeholder?: string;
        leadingIcon?: string;
        clearable?: boolean;
        loading?: boolean;
        heading?: string;
        showPath?: boolean;
        pathSeparator?: string;
        footerAction?: {
            label: string;
            icon?: string;
        };
        addNew?: boolean;
        addNewLabel?: string;
        resource?: string;
        canAddNew?: boolean;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: () => any;
        "update:modelValue": (v: unknown) => any;
        action: () => any;
        "add-new": (payload: {
            query: string;
            path: import("./components/ApexCascadeSelect.vue").CascadeOption[];
        }) => any;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: unknown;
        options?: import("./components/ApexCascadeSelect.vue").CascadeOption[];
        placeholder?: string;
        leadingIcon?: string;
        clearable?: boolean;
        loading?: boolean;
        heading?: string;
        showPath?: boolean;
        pathSeparator?: string;
        footerAction?: {
            label: string;
            icon?: string;
        };
        addNew?: boolean;
        addNewLabel?: string;
        resource?: string;
        canAddNew?: boolean;
    }> & Readonly<{
        onChange?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
        onAction?: (() => any) | undefined;
        "onAdd-new"?: ((payload: {
            query: string;
            path: import("./components/ApexCascadeSelect.vue").CascadeOption[];
        }) => any) | undefined;
    }>, {
        statusIcon: boolean;
        canAddNew: boolean;
        pathSeparator: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    DatePicker: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: (string | Date | null) | (string | Date | null)[];
            dateFormat?: string;
            modelType?: "date" | "string";
            selectionMode?: "single" | "multiple" | "range";
            locale?: Partial<import(".").ApexDateLocale>;
            placeholder?: string;
            showIcon?: boolean;
            icon?: string;
            clearable?: boolean;
            inline?: boolean;
            view?: "date" | "month" | "year";
            numberOfMonths?: number;
            minDate?: Date;
            maxDate?: Date;
            disabledDates?: Date[];
            disabledDays?: number[];
            showButtonBar?: boolean;
            showTime?: boolean;
            timeOnly?: boolean;
            hourFormat?: "12" | "24";
            showSeconds?: boolean;
            stepMinute?: number;
            readonlyInput?: boolean;
            showWeek?: boolean;
            calendarBackground?: string;
            calendarBorderColor?: string;
            calendarRadius?: string;
            calendarShadow?: string;
            dayColor?: string;
            dayRadius?: string;
            dayHoverBackground?: string;
            daySelectedBackground?: string;
            daySelectedColor?: string;
            dayTodayRing?: string;
            dayOutsideColor?: string;
            dayRangeBackground?: string;
        }> & Readonly<{
            onChange?: (() => any) | undefined;
            "onUpdate:modelValue"?: ((v: (string | Date | null) | (string | Date | null)[]) => any) | undefined;
            "onMonth-change"?: ((payload: {
                month: number;
                year: number;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: () => any;
            "update:modelValue": (v: (string | Date | null) | (string | Date | null)[]) => any;
            "month-change": (payload: {
                month: number;
                year: number;
            }) => any;
        }, import("vue").PublicProps, {
            view: "date" | "month" | "year";
            statusIcon: boolean;
            icon: string;
            dateFormat: string;
            modelType: "date" | "string";
            selectionMode: "single" | "multiple" | "range";
            numberOfMonths: number;
            hourFormat: "12" | "24";
            stepMinute: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: (string | Date | null) | (string | Date | null)[];
            dateFormat?: string;
            modelType?: "date" | "string";
            selectionMode?: "single" | "multiple" | "range";
            locale?: Partial<import(".").ApexDateLocale>;
            placeholder?: string;
            showIcon?: boolean;
            icon?: string;
            clearable?: boolean;
            inline?: boolean;
            view?: "date" | "month" | "year";
            numberOfMonths?: number;
            minDate?: Date;
            maxDate?: Date;
            disabledDates?: Date[];
            disabledDays?: number[];
            showButtonBar?: boolean;
            showTime?: boolean;
            timeOnly?: boolean;
            hourFormat?: "12" | "24";
            showSeconds?: boolean;
            stepMinute?: number;
            readonlyInput?: boolean;
            showWeek?: boolean;
            calendarBackground?: string;
            calendarBorderColor?: string;
            calendarRadius?: string;
            calendarShadow?: string;
            dayColor?: string;
            dayRadius?: string;
            dayHoverBackground?: string;
            daySelectedBackground?: string;
            daySelectedColor?: string;
            dayTodayRing?: string;
            dayOutsideColor?: string;
            dayRangeBackground?: string;
        }> & Readonly<{
            onChange?: (() => any) | undefined;
            "onUpdate:modelValue"?: ((v: (string | Date | null) | (string | Date | null)[]) => any) | undefined;
            "onMonth-change"?: ((payload: {
                month: number;
                year: number;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, {
            view: "date" | "month" | "year";
            statusIcon: boolean;
            icon: string;
            dateFormat: string;
            modelType: "date" | "string";
            selectionMode: "single" | "multiple" | "range";
            numberOfMonths: number;
            hourFormat: "12" | "24";
            stepMinute: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: (string | Date | null) | (string | Date | null)[];
        dateFormat?: string;
        modelType?: "date" | "string";
        selectionMode?: "single" | "multiple" | "range";
        locale?: Partial<import(".").ApexDateLocale>;
        placeholder?: string;
        showIcon?: boolean;
        icon?: string;
        clearable?: boolean;
        inline?: boolean;
        view?: "date" | "month" | "year";
        numberOfMonths?: number;
        minDate?: Date;
        maxDate?: Date;
        disabledDates?: Date[];
        disabledDays?: number[];
        showButtonBar?: boolean;
        showTime?: boolean;
        timeOnly?: boolean;
        hourFormat?: "12" | "24";
        showSeconds?: boolean;
        stepMinute?: number;
        readonlyInput?: boolean;
        showWeek?: boolean;
        calendarBackground?: string;
        calendarBorderColor?: string;
        calendarRadius?: string;
        calendarShadow?: string;
        dayColor?: string;
        dayRadius?: string;
        dayHoverBackground?: string;
        daySelectedBackground?: string;
        daySelectedColor?: string;
        dayTodayRing?: string;
        dayOutsideColor?: string;
        dayRangeBackground?: string;
    }> & Readonly<{
        onChange?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: (string | Date | null) | (string | Date | null)[]) => any) | undefined;
        "onMonth-change"?: ((payload: {
            month: number;
            year: number;
        }) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: () => any;
        "update:modelValue": (v: (string | Date | null) | (string | Date | null)[]) => any;
        "month-change": (payload: {
            month: number;
            year: number;
        }) => any;
    }, string, {
        view: "date" | "month" | "year";
        statusIcon: boolean;
        icon: string;
        dateFormat: string;
        modelType: "date" | "string";
        selectionMode: "single" | "multiple" | "range";
        numberOfMonths: number;
        hourFormat: "12" | "24";
        stepMinute: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            date?: (props: {
                date: Date;
                outside: boolean;
                selected: boolean;
            }) => any;
        };
    });
    ColorPicker: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: string | null;
        format?: import(".").ColorFormat;
        showAlpha?: boolean;
        orientation?: "horizontal" | "vertical";
        inline?: boolean;
        presets?: string[];
        showInput?: boolean;
        showFormatToggle?: boolean;
        showChannels?: boolean;
        placeholder?: string;
        pickerBackground?: string;
        pickerBorderColor?: string;
        pickerRadius?: string;
        pickerShadow?: string;
        areaHeight?: string;
        areaWidth?: string;
        areaRadius?: string;
        thumbColor?: string;
        sliderHeight?: string;
        sliderLength?: string;
        sliderThumbColor?: string;
        swatchSize?: string;
        swatchBorderColor?: string;
    }, {
        color: import("vue").ComputedRef<import(".").ApexColor>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: import(".").ApexColor) => any;
        "update:modelValue": (v: string) => any;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: string | null;
        format?: import(".").ColorFormat;
        showAlpha?: boolean;
        orientation?: "horizontal" | "vertical";
        inline?: boolean;
        presets?: string[];
        showInput?: boolean;
        showFormatToggle?: boolean;
        showChannels?: boolean;
        placeholder?: string;
        pickerBackground?: string;
        pickerBorderColor?: string;
        pickerRadius?: string;
        pickerShadow?: string;
        areaHeight?: string;
        areaWidth?: string;
        areaRadius?: string;
        thumbColor?: string;
        sliderHeight?: string;
        sliderLength?: string;
        sliderThumbColor?: string;
        swatchSize?: string;
        swatchBorderColor?: string;
    }> & Readonly<{
        onChange?: ((v: import(".").ApexColor) => any) | undefined;
        "onUpdate:modelValue"?: ((v: string) => any) | undefined;
    }>, {
        statusIcon: boolean;
        format: import(".").ColorFormat;
        showAlpha: boolean;
        orientation: "horizontal" | "vertical";
        showInput: boolean;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Otp: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: string | null;
        length?: number;
        mask?: boolean;
        integerOnly?: boolean;
        variant?: "outlined" | "filled";
        autofocus?: boolean;
    }, {
        focus: () => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (v: string) => void;
        complete: (v: string) => void;
        blur: () => void;
        focus: () => void;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: string | null;
        length?: number;
        mask?: boolean;
        integerOnly?: boolean;
        variant?: "outlined" | "filled";
        autofocus?: boolean;
    }> & Readonly<{
        onBlur?: (() => any) | undefined;
        onFocus?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: string) => any) | undefined;
        onComplete?: ((v: string) => any) | undefined;
    }>, {
        length: number;
        statusIcon: boolean;
        variant: "outlined" | "filled";
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Password: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: string | null;
        placeholder?: string;
        leadingIcon?: string;
        toggleMask?: boolean;
        meter?: boolean;
        checklist?: boolean;
        popover?: boolean;
        requirements?: import("./components/ApexPassword.vue").PasswordRule[];
        minLength?: number;
        strengthLabels?: [string, string, string, string];
        autocomplete?: string;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (v: string) => void;
        blur: () => void;
        focus: () => void;
        strength: (payload: {
            score: number;
            label: string;
        }) => void;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: string | null;
        placeholder?: string;
        leadingIcon?: string;
        toggleMask?: boolean;
        meter?: boolean;
        checklist?: boolean;
        popover?: boolean;
        requirements?: import("./components/ApexPassword.vue").PasswordRule[];
        minLength?: number;
        strengthLabels?: [string, string, string, string];
        autocomplete?: string;
    }> & Readonly<{
        onBlur?: (() => any) | undefined;
        onFocus?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: string) => any) | undefined;
        onStrength?: ((payload: {
            score: number;
            label: string;
        }) => any) | undefined;
    }>, {
        meter: boolean;
        statusIcon: boolean;
        autocomplete: string;
        minLength: number;
        toggleMask: boolean;
        checklist: boolean;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Tags: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: string[];
        placeholder?: string;
        leadingIcon?: string;
        delimiter?: string;
        allowDuplicate?: boolean;
        max?: number;
        options?: import("./types").ApexOptionsInput;
        restrict?: boolean;
        trim?: boolean;
        clearable?: boolean;
        addOnBlur?: boolean;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (v: string[]) => void;
        add: (tag: string) => void;
        remove: (tag: string) => void;
        blur: () => void;
        focus: () => void;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: string[];
        placeholder?: string;
        leadingIcon?: string;
        delimiter?: string;
        allowDuplicate?: boolean;
        max?: number;
        options?: import("./types").ApexOptionsInput;
        restrict?: boolean;
        trim?: boolean;
        clearable?: boolean;
        addOnBlur?: boolean;
    }> & Readonly<{
        onBlur?: (() => any) | undefined;
        onFocus?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: string[]) => any) | undefined;
        onRemove?: ((tag: string) => any) | undefined;
        onAdd?: ((tag: string) => any) | undefined;
    }>, {
        trim: boolean;
        statusIcon: boolean;
        addOnBlur: boolean;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Knob: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: number | null;
        min?: number;
        max?: number;
        step?: number;
        diameter?: number;
        strokeWidth?: number;
        arc?: number;
        railWidth?: number;
        textSize?: number;
        valueColor?: string;
        rangeColor?: string;
        textColor?: string;
        hideValue?: boolean;
        valueTemplate?: (v: number) => string;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: number) => any;
        "update:modelValue": (v: number) => any;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: number | null;
        min?: number;
        max?: number;
        step?: number;
        diameter?: number;
        strokeWidth?: number;
        arc?: number;
        railWidth?: number;
        textSize?: number;
        valueColor?: string;
        rangeColor?: string;
        textColor?: string;
        hideValue?: boolean;
        valueTemplate?: (v: number) => string;
    }> & Readonly<{
        onChange?: ((v: number) => any) | undefined;
        "onUpdate:modelValue"?: ((v: number) => any) | undefined;
    }>, {
        statusIcon: boolean;
        min: number;
        max: number;
        step: number;
        diameter: number;
        strokeWidth: number;
        arc: number;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Listbox: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown;
            options?: import("./types").ApexOptionsInput | import("./components/ApexListbox.vue").ListboxGroup[];
            multiple?: boolean;
            checkbox?: boolean;
            filter?: boolean;
            filterPlaceholder?: string;
            scrollHeight?: number;
            toggleAll?: boolean;
            max?: number;
            emptyMessage?: string;
            addNew?: boolean;
            addNewLabel?: string;
            resource?: string;
            canAddNew?: boolean;
        }> & Readonly<{
            onChange?: (() => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
            "onAdd-new"?: ((payload: {
                query: string;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: () => any;
            "update:modelValue": (v: unknown) => any;
            "add-new": (payload: {
                query: string;
            }) => any;
        }, import("vue").PublicProps, {
            statusIcon: boolean;
            canAddNew: boolean;
            scrollHeight: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown;
            options?: import("./types").ApexOptionsInput | import("./components/ApexListbox.vue").ListboxGroup[];
            multiple?: boolean;
            checkbox?: boolean;
            filter?: boolean;
            filterPlaceholder?: string;
            scrollHeight?: number;
            toggleAll?: boolean;
            max?: number;
            emptyMessage?: string;
            addNew?: boolean;
            addNewLabel?: string;
            resource?: string;
            canAddNew?: boolean;
        }> & Readonly<{
            onChange?: (() => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
            "onAdd-new"?: ((payload: {
                query: string;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, {
            statusIcon: boolean;
            canAddNew: boolean;
            scrollHeight: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: unknown;
        options?: import("./types").ApexOptionsInput | import("./components/ApexListbox.vue").ListboxGroup[];
        multiple?: boolean;
        checkbox?: boolean;
        filter?: boolean;
        filterPlaceholder?: string;
        scrollHeight?: number;
        toggleAll?: boolean;
        max?: number;
        emptyMessage?: string;
        addNew?: boolean;
        addNewLabel?: string;
        resource?: string;
        canAddNew?: boolean;
    }> & Readonly<{
        onChange?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
        "onAdd-new"?: ((payload: {
            query: string;
        }) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: () => any;
        "update:modelValue": (v: unknown) => any;
        "add-new": (payload: {
            query: string;
        }) => any;
    }, string, {
        statusIcon: boolean;
        canAddNew: boolean;
        scrollHeight: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            option?: (props: {
                option: import("./types").ApexOption<unknown>;
            }) => any;
        };
    });
    OrderList: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: import("./types").ApexOptionsInput;
            selection?: unknown[];
            checkbox?: boolean;
            multiple?: boolean;
            filter?: boolean;
            filterPlaceholder?: string;
            scrollHeight?: number;
            controls?: "start" | "end" | "top" | "none";
            controlsAlign?: "start" | "center" | "end";
            extremes?: boolean;
            noDrag?: boolean;
            emptyMessage?: string;
            addNew?: boolean;
            addNewLabel?: string;
            resource?: string;
            canAddNew?: boolean;
            panelBackground?: string;
            panelBorderColor?: string;
            panelRadius?: string;
            rowColor?: string;
            rowRadius?: string;
            rowHoverBackground?: string;
            rowSelectedBackground?: string;
            rowSelectedColor?: string;
            moveButtonColor?: string;
            moveButtonSize?: string;
            gripColor?: string;
        }> & Readonly<{
            onChange?: (() => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown[]) => any) | undefined;
            "onAdd-new"?: ((payload: {
                query: string;
            }) => any) | undefined;
            "onUpdate:selection"?: ((v: unknown[]) => any) | undefined;
            onReorder?: ((payload: {
                from: number;
                to: number;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: () => any;
            "update:modelValue": (v: unknown[]) => any;
            "add-new": (payload: {
                query: string;
            }) => any;
            "update:selection": (v: unknown[]) => any;
            reorder: (payload: {
                from: number;
                to: number;
            }) => any;
        }, import("vue").PublicProps, {
            statusIcon: boolean;
            canAddNew: boolean;
            scrollHeight: number;
            controls: "start" | "end" | "top" | "none";
            controlsAlign: "start" | "center" | "end";
            extremes: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: import("./types").ApexOptionsInput;
            selection?: unknown[];
            checkbox?: boolean;
            multiple?: boolean;
            filter?: boolean;
            filterPlaceholder?: string;
            scrollHeight?: number;
            controls?: "start" | "end" | "top" | "none";
            controlsAlign?: "start" | "center" | "end";
            extremes?: boolean;
            noDrag?: boolean;
            emptyMessage?: string;
            addNew?: boolean;
            addNewLabel?: string;
            resource?: string;
            canAddNew?: boolean;
            panelBackground?: string;
            panelBorderColor?: string;
            panelRadius?: string;
            rowColor?: string;
            rowRadius?: string;
            rowHoverBackground?: string;
            rowSelectedBackground?: string;
            rowSelectedColor?: string;
            moveButtonColor?: string;
            moveButtonSize?: string;
            gripColor?: string;
        }> & Readonly<{
            onChange?: (() => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown[]) => any) | undefined;
            "onAdd-new"?: ((payload: {
                query: string;
            }) => any) | undefined;
            "onUpdate:selection"?: ((v: unknown[]) => any) | undefined;
            onReorder?: ((payload: {
                from: number;
                to: number;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, {
            statusIcon: boolean;
            canAddNew: boolean;
            scrollHeight: number;
            controls: "start" | "end" | "top" | "none";
            controlsAlign: "start" | "center" | "end";
            extremes: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: import("./types").ApexOptionsInput;
        selection?: unknown[];
        checkbox?: boolean;
        multiple?: boolean;
        filter?: boolean;
        filterPlaceholder?: string;
        scrollHeight?: number;
        controls?: "start" | "end" | "top" | "none";
        controlsAlign?: "start" | "center" | "end";
        extremes?: boolean;
        noDrag?: boolean;
        emptyMessage?: string;
        addNew?: boolean;
        addNewLabel?: string;
        resource?: string;
        canAddNew?: boolean;
        panelBackground?: string;
        panelBorderColor?: string;
        panelRadius?: string;
        rowColor?: string;
        rowRadius?: string;
        rowHoverBackground?: string;
        rowSelectedBackground?: string;
        rowSelectedColor?: string;
        moveButtonColor?: string;
        moveButtonSize?: string;
        gripColor?: string;
    }> & Readonly<{
        onChange?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: unknown[]) => any) | undefined;
        "onAdd-new"?: ((payload: {
            query: string;
        }) => any) | undefined;
        "onUpdate:selection"?: ((v: unknown[]) => any) | undefined;
        onReorder?: ((payload: {
            from: number;
            to: number;
        }) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: () => any;
        "update:modelValue": (v: unknown[]) => any;
        "add-new": (payload: {
            query: string;
        }) => any;
        "update:selection": (v: unknown[]) => any;
        reorder: (payload: {
            from: number;
            to: number;
        }) => any;
    }, string, {
        statusIcon: boolean;
        canAddNew: boolean;
        scrollHeight: number;
        controls: "start" | "end" | "top" | "none";
        controlsAlign: "start" | "center" | "end";
        extremes: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            item?: (props: {
                item: import("./types").ApexOption<unknown>;
                index: number;
            }) => any;
        };
    });
    Rating: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: number | null;
        stars?: number;
        allowHalf?: boolean;
        orientation?: "horizontal" | "vertical";
        starSize?: number;
        shape?: "star" | "triangle" | "dot" | "square";
        variant?: "filled" | "outline";
        icon?: string;
        emptyIcon?: string;
        color?: string;
        cancel?: boolean;
        showValue?: boolean;
        emptyColor?: string;
        gap?: string;
        cancelColor?: string;
        cancelHoverColor?: string;
        valueColor?: string;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: number | null) => any;
        "update:modelValue": (v: number | null) => any;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: number | null;
        stars?: number;
        allowHalf?: boolean;
        orientation?: "horizontal" | "vertical";
        starSize?: number;
        shape?: "star" | "triangle" | "dot" | "square";
        variant?: "filled" | "outline";
        icon?: string;
        emptyIcon?: string;
        color?: string;
        cancel?: boolean;
        showValue?: boolean;
        emptyColor?: string;
        gap?: string;
        cancelColor?: string;
        cancelHoverColor?: string;
        valueColor?: string;
    }> & Readonly<{
        onChange?: ((v: number | null) => any) | undefined;
        "onUpdate:modelValue"?: ((v: number | null) => any) | undefined;
    }>, {
        statusIcon: boolean;
        orientation: "horizontal" | "vertical";
        variant: "filled" | "outline";
        stars: number;
        shape: "star" | "triangle" | "dot" | "square";
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    SelectButton: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown;
            options?: import("./types").ApexOptionsInput;
            multiple?: boolean;
            block?: boolean;
            vertical?: boolean;
            detached?: boolean;
            allowEmpty?: boolean;
            iconOnly?: boolean;
            color?: string;
            textColor?: string;
            mutedColor?: string;
            barBackground?: string;
            barBorderColor?: string;
            barRadius?: string;
            hoverBackground?: string;
            hoverColor?: string;
        }> & Readonly<{
            onChange?: (() => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: () => any;
            "update:modelValue": (v: unknown) => any;
        }, import("vue").PublicProps, {
            statusIcon: boolean;
            allowEmpty: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown;
            options?: import("./types").ApexOptionsInput;
            multiple?: boolean;
            block?: boolean;
            vertical?: boolean;
            detached?: boolean;
            allowEmpty?: boolean;
            iconOnly?: boolean;
            color?: string;
            textColor?: string;
            mutedColor?: string;
            barBackground?: string;
            barBorderColor?: string;
            barRadius?: string;
            hoverBackground?: string;
            hoverColor?: string;
        }> & Readonly<{
            onChange?: (() => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
        }>, {}, {}, {}, {}, {
            statusIcon: boolean;
            allowEmpty: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: unknown;
        options?: import("./types").ApexOptionsInput;
        multiple?: boolean;
        block?: boolean;
        vertical?: boolean;
        detached?: boolean;
        allowEmpty?: boolean;
        iconOnly?: boolean;
        color?: string;
        textColor?: string;
        mutedColor?: string;
        barBackground?: string;
        barBorderColor?: string;
        barRadius?: string;
        hoverBackground?: string;
        hoverColor?: string;
    }> & Readonly<{
        onChange?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: () => any;
        "update:modelValue": (v: unknown) => any;
    }, string, {
        statusIcon: boolean;
        allowEmpty: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            option?: (props: {
                option: import("./types").ApexOption<unknown>;
            }) => any;
        };
    });
    Slider: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: number | number[] | null;
        min?: number;
        max?: number;
        step?: number;
        range?: boolean;
        minStepsBetweenHandles?: number;
        orientation?: "horizontal" | "vertical";
        length?: number;
        handleSize?: number;
        tooltipBackground?: string;
        tooltipColor?: string;
        showTooltip?: boolean;
        trackSize?: number;
        color?: string;
        trackColor?: string;
        handleColor?: string;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: number | number[]) => any;
        "update:modelValue": (v: number | number[]) => any;
        slideend: (v: number | number[]) => any;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: number | number[] | null;
        min?: number;
        max?: number;
        step?: number;
        range?: boolean;
        minStepsBetweenHandles?: number;
        orientation?: "horizontal" | "vertical";
        length?: number;
        handleSize?: number;
        tooltipBackground?: string;
        tooltipColor?: string;
        showTooltip?: boolean;
        trackSize?: number;
        color?: string;
        trackColor?: string;
        handleColor?: string;
    }> & Readonly<{
        onChange?: ((v: number | number[]) => any) | undefined;
        "onUpdate:modelValue"?: ((v: number | number[]) => any) | undefined;
        onSlideend?: ((v: number | number[]) => any) | undefined;
    }>, {
        length: number;
        statusIcon: boolean;
        min: number;
        max: number;
        step: number;
        orientation: "horizontal" | "vertical";
        minStepsBetweenHandles: number;
        trackSize: number;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    ToggleButton: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: boolean;
            onLabel?: string;
            offLabel?: string;
            onIcon?: string;
            offIcon?: string;
            block?: boolean;
            onColor?: string;
            onTextColor?: string;
            variant?: "solid" | "outline";
            offBackground?: string;
            offColor?: string;
            offBorderColor?: string;
            offRadius?: string;
            hoverColor?: string;
            hoverBorderColor?: string;
        }> & Readonly<{
            onChange?: ((v: boolean) => any) | undefined;
            "onUpdate:modelValue"?: ((v: boolean) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: (v: boolean) => any;
            "update:modelValue": (v: boolean) => any;
        }, import("vue").PublicProps, {
            statusIcon: boolean;
            variant: "solid" | "outline";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: boolean;
            onLabel?: string;
            offLabel?: string;
            onIcon?: string;
            offIcon?: string;
            block?: boolean;
            onColor?: string;
            onTextColor?: string;
            variant?: "solid" | "outline";
            offBackground?: string;
            offColor?: string;
            offBorderColor?: string;
            offRadius?: string;
            hoverColor?: string;
            hoverBorderColor?: string;
        }> & Readonly<{
            onChange?: ((v: boolean) => any) | undefined;
            "onUpdate:modelValue"?: ((v: boolean) => any) | undefined;
        }>, {}, {}, {}, {}, {
            statusIcon: boolean;
            variant: "solid" | "outline";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: boolean;
        onLabel?: string;
        offLabel?: string;
        onIcon?: string;
        offIcon?: string;
        block?: boolean;
        onColor?: string;
        onTextColor?: string;
        variant?: "solid" | "outline";
        offBackground?: string;
        offColor?: string;
        offBorderColor?: string;
        offRadius?: string;
        hoverColor?: string;
        hoverBorderColor?: string;
    }> & Readonly<{
        onChange?: ((v: boolean) => any) | undefined;
        "onUpdate:modelValue"?: ((v: boolean) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: boolean) => any;
        "update:modelValue": (v: boolean) => any;
    }, string, {
        statusIcon: boolean;
        variant: "solid" | "outline";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {
                on: boolean;
            }) => any;
        };
    });
    TreeSelect: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: string | string[] | null;
        nodes?: import(".").TreeNode[];
        placeholder?: string;
        leadingIcon?: string;
        multiple?: boolean;
        checkbox?: boolean;
        leafOnly?: boolean;
        filter?: boolean;
        filterPlaceholder?: string;
        expandAll?: boolean;
        clearable?: boolean;
        showPath?: boolean;
        pathSeparator?: string;
        scrollHeight?: number;
        maxChips?: number;
        addNew?: boolean;
        addNewLabel?: string;
        resource?: string;
        canAddNew?: boolean;
        nodeColor?: string;
        nodeRadius?: string;
        nodeHoverBackground?: string;
        nodeSelectedBackground?: string;
        nodeSelectedColor?: string;
        twistyColor?: string;
        indent?: string;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (v: string | string[] | null) => void;
        change: () => void;
        "node-expand": (node: import(".").TreeNode) => void;
        "node-collapse": (node: import(".").TreeNode) => void;
        "add-new": (payload: {
            query: string;
            path: import(".").TreeNode[];
        }) => void;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: string | string[] | null;
        nodes?: import(".").TreeNode[];
        placeholder?: string;
        leadingIcon?: string;
        multiple?: boolean;
        checkbox?: boolean;
        leafOnly?: boolean;
        filter?: boolean;
        filterPlaceholder?: string;
        expandAll?: boolean;
        clearable?: boolean;
        showPath?: boolean;
        pathSeparator?: string;
        scrollHeight?: number;
        maxChips?: number;
        addNew?: boolean;
        addNewLabel?: string;
        resource?: string;
        canAddNew?: boolean;
        nodeColor?: string;
        nodeRadius?: string;
        nodeHoverBackground?: string;
        nodeSelectedBackground?: string;
        nodeSelectedColor?: string;
        twistyColor?: string;
        indent?: string;
    }> & Readonly<{
        onChange?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: string | string[] | null) => any) | undefined;
        "onAdd-new"?: ((payload: {
            query: string;
            path: import(".").TreeNode[];
        }) => any) | undefined;
        "onNode-expand"?: ((node: import(".").TreeNode) => any) | undefined;
        "onNode-collapse"?: ((node: import(".").TreeNode) => any) | undefined;
    }>, {
        statusIcon: boolean;
        canAddNew: boolean;
        pathSeparator: string;
        scrollHeight: number;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Checkbox: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: boolean | unknown[];
            value?: unknown;
            indeterminate?: boolean;
            card?: boolean;
            icon?: string;
            image?: string;
            hint?: string;
            bare?: boolean;
        }> & Readonly<{
            onChange?: ((v: boolean) => any) | undefined;
            "onUpdate:modelValue"?: ((v: boolean | unknown[]) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: (v: boolean) => any;
            "update:modelValue": (v: boolean | unknown[]) => any;
        }, import("vue").PublicProps, {
            labelPlacement: import("./types").ApexLabelPlacement;
            statusIcon: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: boolean | unknown[];
            value?: unknown;
            indeterminate?: boolean;
            card?: boolean;
            icon?: string;
            image?: string;
            hint?: string;
            bare?: boolean;
        }> & Readonly<{
            onChange?: ((v: boolean) => any) | undefined;
            "onUpdate:modelValue"?: ((v: boolean | unknown[]) => any) | undefined;
        }>, {}, {}, {}, {}, {
            labelPlacement: import("./types").ApexLabelPlacement;
            statusIcon: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: boolean | unknown[];
        value?: unknown;
        indeterminate?: boolean;
        card?: boolean;
        icon?: string;
        image?: string;
        hint?: string;
        bare?: boolean;
    }> & Readonly<{
        onChange?: ((v: boolean) => any) | undefined;
        "onUpdate:modelValue"?: ((v: boolean | unknown[]) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: boolean) => any;
        "update:modelValue": (v: boolean | unknown[]) => any;
    }, string, {
        labelPlacement: import("./types").ApexLabelPlacement;
        statusIcon: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        };
    });
    CheckboxGroup: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown[];
            options?: import("./types").ApexOptionsInput;
            inline?: boolean;
            columns?: number;
            card?: boolean;
            toggleAll?: boolean;
            max?: number;
        }> & Readonly<{
            onChange?: (() => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown[]) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: () => any;
            "update:modelValue": (v: unknown[]) => any;
        }, import("vue").PublicProps, {
            statusIcon: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown[];
            options?: import("./types").ApexOptionsInput;
            inline?: boolean;
            columns?: number;
            card?: boolean;
            toggleAll?: boolean;
            max?: number;
        }> & Readonly<{
            onChange?: (() => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown[]) => any) | undefined;
        }>, {}, {}, {}, {}, {
            statusIcon: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: unknown[];
        options?: import("./types").ApexOptionsInput;
        inline?: boolean;
        columns?: number;
        card?: boolean;
        toggleAll?: boolean;
        max?: number;
    }> & Readonly<{
        onChange?: (() => any) | undefined;
        "onUpdate:modelValue"?: ((v: unknown[]) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: () => any;
        "update:modelValue": (v: unknown[]) => any;
    }, string, {
        statusIcon: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            option?: (props: {
                option: import("./types").ApexOption<unknown>;
            }) => any;
        };
    });
    Switch: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: boolean;
        onLabel?: string;
        offLabel?: string;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: boolean) => any;
        "update:modelValue": (v: boolean) => any;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: boolean;
        onLabel?: string;
        offLabel?: string;
    }> & Readonly<{
        onChange?: ((v: boolean) => any) | undefined;
        "onUpdate:modelValue"?: ((v: boolean) => any) | undefined;
    }>, {
        labelPlacement: import("./types").ApexLabelPlacement;
        statusIcon: boolean;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Segmented: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown;
            options?: import("./types").ApexOptionsInput;
            block?: boolean;
            barBackground?: string;
            barBorderColor?: string;
            barRadius?: string;
            optionColor?: string;
            hoverColor?: string;
            selectedBackground?: string;
            selectedColor?: string;
        }> & Readonly<{
            onChange?: ((v: unknown) => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: (v: unknown) => any;
            "update:modelValue": (v: unknown) => any;
        }, import("vue").PublicProps, {
            statusIcon: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown;
            options?: import("./types").ApexOptionsInput;
            block?: boolean;
            barBackground?: string;
            barBorderColor?: string;
            barRadius?: string;
            optionColor?: string;
            hoverColor?: string;
            selectedBackground?: string;
            selectedColor?: string;
        }> & Readonly<{
            onChange?: ((v: unknown) => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
        }>, {}, {}, {}, {}, {
            statusIcon: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: unknown;
        options?: import("./types").ApexOptionsInput;
        block?: boolean;
        barBackground?: string;
        barBorderColor?: string;
        barRadius?: string;
        optionColor?: string;
        hoverColor?: string;
        selectedBackground?: string;
        selectedColor?: string;
    }> & Readonly<{
        onChange?: ((v: unknown) => any) | undefined;
        "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: unknown) => any;
        "update:modelValue": (v: unknown) => any;
    }, string, {
        statusIcon: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            option?: (props: {
                option: import("./types").ApexOption<unknown>;
            }) => any;
        };
    });
    Radio: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown;
            value?: unknown;
            card?: boolean;
            icon?: string;
            image?: string;
            hint?: string;
            bare?: boolean;
        }> & Readonly<{
            onChange?: ((v: unknown) => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: (v: unknown) => any;
            "update:modelValue": (v: unknown) => any;
        }, import("vue").PublicProps, {
            statusIcon: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown;
            value?: unknown;
            card?: boolean;
            icon?: string;
            image?: string;
            hint?: string;
            bare?: boolean;
        }> & Readonly<{
            onChange?: ((v: unknown) => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
        }>, {}, {}, {}, {}, {
            statusIcon: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: unknown;
        value?: unknown;
        card?: boolean;
        icon?: string;
        image?: string;
        hint?: string;
        bare?: boolean;
    }> & Readonly<{
        onChange?: ((v: unknown) => any) | undefined;
        "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: unknown) => any;
        "update:modelValue": (v: unknown) => any;
    }, string, {
        statusIcon: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        };
    });
    RadioGroup: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown;
            options?: import("./types").ApexOptionsInput;
            card?: boolean;
            inline?: boolean;
            columns?: number;
        }> & Readonly<{
            onChange?: ((v: unknown) => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: (v: unknown) => any;
            "update:modelValue": (v: unknown) => any;
        }, import("vue").PublicProps, {
            statusIcon: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            modelValue?: unknown;
            options?: import("./types").ApexOptionsInput;
            card?: boolean;
            inline?: boolean;
            columns?: number;
        }> & Readonly<{
            onChange?: ((v: unknown) => any) | undefined;
            "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
        }>, {}, {}, {}, {}, {
            statusIcon: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        modelValue?: unknown;
        options?: import("./types").ApexOptionsInput;
        card?: boolean;
        inline?: boolean;
        columns?: number;
    }> & Readonly<{
        onChange?: ((v: unknown) => any) | undefined;
        "onUpdate:modelValue"?: ((v: unknown) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: unknown) => any;
        "update:modelValue": (v: unknown) => any;
    }, string, {
        statusIcon: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            option?: (props: {
                option: import("./types").ApexOption<unknown>;
            }) => any;
        };
    });
    Button: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexButtonAppearance & {
            severity?: import(".").ApexSeverity;
            variant?: import(".").ApexButtonVariant | "primary" | "secondary" | "ghost" | "danger" | "outline-danger";
            size?: import("./types").ApexSize;
            icon?: string;
            trailingIcon?: string;
            iconPos?: "left" | "right" | "top" | "bottom";
            raised?: boolean;
            rounded?: boolean;
            iconOnly?: boolean;
            label?: string;
            badge?: string | number;
            badgeSeverity?: import(".").ApexSeverity;
            loading?: boolean;
            disabled?: boolean;
            block?: boolean;
            type?: "button" | "submit" | "reset";
            href?: string;
            target?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            size: import("./types").ApexSize;
            type: "button" | "submit" | "reset";
            iconPos: "left" | "right" | "top" | "bottom";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexButtonAppearance & {
            severity?: import(".").ApexSeverity;
            variant?: import(".").ApexButtonVariant | "primary" | "secondary" | "ghost" | "danger" | "outline-danger";
            size?: import("./types").ApexSize;
            icon?: string;
            trailingIcon?: string;
            iconPos?: "left" | "right" | "top" | "bottom";
            raised?: boolean;
            rounded?: boolean;
            iconOnly?: boolean;
            label?: string;
            badge?: string | number;
            badgeSeverity?: import(".").ApexSeverity;
            loading?: boolean;
            disabled?: boolean;
            block?: boolean;
            type?: "button" | "submit" | "reset";
            href?: string;
            target?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            size: import("./types").ApexSize;
            type: "button" | "submit" | "reset";
            iconPos: "left" | "right" | "top" | "bottom";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexButtonAppearance & {
        severity?: import(".").ApexSeverity;
        variant?: import(".").ApexButtonVariant | "primary" | "secondary" | "ghost" | "danger" | "outline-danger";
        size?: import("./types").ApexSize;
        icon?: string;
        trailingIcon?: string;
        iconPos?: "left" | "right" | "top" | "bottom";
        raised?: boolean;
        rounded?: boolean;
        iconOnly?: boolean;
        label?: string;
        badge?: string | number;
        badgeSeverity?: import(".").ApexSeverity;
        loading?: boolean;
        disabled?: boolean;
        block?: boolean;
        type?: "button" | "submit" | "reset";
        href?: string;
        target?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        size: import("./types").ApexSize;
        type: "button" | "submit" | "reset";
        iconPos: "left" | "right" | "top" | "bottom";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    ButtonGroup: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexButtonAppearance & {
            orientation?: "horizontal" | "vertical";
            block?: boolean;
            label?: string;
            hideLabel?: boolean;
            size?: import("./types").ApexSize;
            help?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            orientation: "horizontal" | "vertical";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexButtonAppearance & {
            orientation?: "horizontal" | "vertical";
            block?: boolean;
            label?: string;
            hideLabel?: boolean;
            size?: import("./types").ApexSize;
            help?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            orientation: "horizontal" | "vertical";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexButtonAppearance & {
        orientation?: "horizontal" | "vertical";
        block?: boolean;
        label?: string;
        hideLabel?: boolean;
        size?: import("./types").ApexSize;
        help?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        orientation: "horizontal" | "vertical";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        };
    });
    SpeedDial: import("vue").DefineComponent<Omit<import("./types").ApexButtonAppearance, "radius"> & {
        items?: import(".").SpeedDialItem[];
        type?: import(".").SpeedDialType;
        direction?: import(".").SpeedDialDirection;
        radius?: number;
        gap?: number;
        transitionDelay?: number;
        icon?: string;
        activeIcon?: string;
        severity?: string;
        size?: import("./types").ApexSize;
        mask?: boolean;
        maskColor?: string;
        maskOpacity?: number;
        tooltip?: boolean;
        hover?: boolean;
        disabled?: boolean;
        label?: string;
        position?: "inline" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
        actionBackground?: string;
        actionColor?: string;
        actionBorderColor?: string;
        actionRadius?: string;
        actionHoverColor?: string;
        actionHoverBorderColor?: string;
        actionSize?: string;
    }, {
        open: import("vue").Ref<boolean, boolean>;
        setOpen: (v: boolean) => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:open": (v: boolean) => void;
        "item-click": (payload: {
            item: import(".").SpeedDialItem;
            index: number;
            event: MouseEvent;
        }) => void;
        show: () => void;
        hide: () => void;
    }, string, import("vue").PublicProps, Readonly<Omit<import("./types").ApexButtonAppearance, "radius"> & {
        items?: import(".").SpeedDialItem[];
        type?: import(".").SpeedDialType;
        direction?: import(".").SpeedDialDirection;
        radius?: number;
        gap?: number;
        transitionDelay?: number;
        icon?: string;
        activeIcon?: string;
        severity?: string;
        size?: import("./types").ApexSize;
        mask?: boolean;
        maskColor?: string;
        maskOpacity?: number;
        tooltip?: boolean;
        hover?: boolean;
        disabled?: boolean;
        label?: string;
        position?: "inline" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
        actionBackground?: string;
        actionColor?: string;
        actionBorderColor?: string;
        actionRadius?: string;
        actionHoverColor?: string;
        actionHoverBorderColor?: string;
        actionSize?: string;
    }> & Readonly<{
        "onUpdate:open"?: ((v: boolean) => any) | undefined;
        "onItem-click"?: ((payload: {
            item: import(".").SpeedDialItem;
            index: number;
            event: MouseEvent;
        }) => any) | undefined;
        onShow?: (() => any) | undefined;
        onHide?: (() => any) | undefined;
    }>, {
        size: import("./types").ApexSize;
        type: import(".").SpeedDialType;
        radius: number;
        position: "inline" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
        icon: string;
        gap: number;
        severity: string;
        direction: import(".").SpeedDialDirection;
        transitionDelay: number;
        activeIcon: string;
        maskColor: string;
        maskOpacity: number;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    SplitButton: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexButtonAppearance & {
            label?: string;
            icon?: string;
            model?: import(".").MenuItem[];
            severity?: import(".").ApexSeverity;
            variant?: import(".").ApexButtonVariant;
            size?: import("./types").ApexSize;
            raised?: boolean;
            rounded?: boolean;
            loading?: boolean;
            disabled?: boolean;
            menuIcon?: string;
            menuAlign?: "start" | "end";
            menuLabel?: string;
            menuBackground?: string;
            menuBorderColor?: string;
            menuRadius?: string;
            menuColor?: string;
            menuHoverBackground?: string;
            menuHoverColor?: string;
            menuIconColor?: string;
            menuHeaderColor?: string;
            menuHintColor?: string;
            menuSeparatorColor?: string;
        }> & Readonly<{
            onClick?: ((event: MouseEvent) => any) | undefined;
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                event: MouseEvent;
            }) => any) | undefined;
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            click: (event: MouseEvent) => void;
            "item-click": (payload: {
                item: import(".").MenuItem;
                event: MouseEvent;
            }) => void;
            show: () => void;
            hide: () => void;
        }, import("vue").PublicProps, {
            size: import("./types").ApexSize;
            variant: import(".").ApexButtonVariant;
            severity: import(".").ApexSeverity;
            menuIcon: string;
            menuAlign: "start" | "end";
            menuLabel: string;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexButtonAppearance & {
            label?: string;
            icon?: string;
            model?: import(".").MenuItem[];
            severity?: import(".").ApexSeverity;
            variant?: import(".").ApexButtonVariant;
            size?: import("./types").ApexSize;
            raised?: boolean;
            rounded?: boolean;
            loading?: boolean;
            disabled?: boolean;
            menuIcon?: string;
            menuAlign?: "start" | "end";
            menuLabel?: string;
            menuBackground?: string;
            menuBorderColor?: string;
            menuRadius?: string;
            menuColor?: string;
            menuHoverBackground?: string;
            menuHoverColor?: string;
            menuIconColor?: string;
            menuHeaderColor?: string;
            menuHintColor?: string;
            menuSeparatorColor?: string;
        }> & Readonly<{
            onClick?: ((event: MouseEvent) => any) | undefined;
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                event: MouseEvent;
            }) => any) | undefined;
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
        }>, {}, {}, {}, {}, {
            size: import("./types").ApexSize;
            variant: import(".").ApexButtonVariant;
            severity: import(".").ApexSeverity;
            menuIcon: string;
            menuAlign: "start" | "end";
            menuLabel: string;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexButtonAppearance & {
        label?: string;
        icon?: string;
        model?: import(".").MenuItem[];
        severity?: import(".").ApexSeverity;
        variant?: import(".").ApexButtonVariant;
        size?: import("./types").ApexSize;
        raised?: boolean;
        rounded?: boolean;
        loading?: boolean;
        disabled?: boolean;
        menuIcon?: string;
        menuAlign?: "start" | "end";
        menuLabel?: string;
        menuBackground?: string;
        menuBorderColor?: string;
        menuRadius?: string;
        menuColor?: string;
        menuHoverBackground?: string;
        menuHoverColor?: string;
        menuIconColor?: string;
        menuHeaderColor?: string;
        menuHintColor?: string;
        menuSeparatorColor?: string;
    }> & Readonly<{
        onClick?: ((event: MouseEvent) => any) | undefined;
        "onItem-click"?: ((payload: {
            item: import(".").MenuItem;
            event: MouseEvent;
        }) => any) | undefined;
        onShow?: (() => any) | undefined;
        onHide?: (() => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        click: (event: MouseEvent) => void;
        "item-click": (payload: {
            item: import(".").MenuItem;
            event: MouseEvent;
        }) => void;
        show: () => void;
        hide: () => void;
    }, string, {
        size: import("./types").ApexSize;
        variant: import(".").ApexButtonVariant;
        severity: import(".").ApexSeverity;
        menuIcon: string;
        menuAlign: "start" | "end";
        menuLabel: string;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    DataTable: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            ui?: import("./types").ApexDataTableClasses;
            value?: {
                [x: string]: unknown;
            }[];
            columns?: import(".").ColumnDef[];
            dataKey?: string;
            size?: "small" | "normal" | "large";
            gridLines?: "none" | "both" | "horizontal" | "vertical";
            gridLineSize?: number;
            gridLineColor?: string;
            striped?: boolean;
            stripeColor?: string;
            borderColor?: string;
            headerBackground?: string;
            bordered?: boolean;
            selection?: {
                [x: string]: unknown;
            } | {
                [x: string]: unknown;
            }[] | null;
            selectionMode?: "single" | "multiple" | "checkbox" | "radio" | null;
            selectionColor?: string;
            showSelectionCount?: boolean;
            metaKeySelection?: boolean;
            sortMode?: "single" | "multiple";
            sortField?: string;
            sortOrder?: import(".").SortOrder;
            multiSortMeta?: import(".").SortMeta[];
            removableSort?: boolean;
            paginator?: boolean;
            rows?: number;
            first?: number;
            rowsPerPageOptions?: number[];
            paginatorTemplate?: string;
            lazy?: boolean;
            totalRecords?: number;
            scrollable?: boolean;
            scrollHeight?: string;
            flexible?: boolean;
            tableMinWidth?: string;
            editMode?: "cell" | "row" | null;
            editingRows?: {
                [x: string]: unknown;
            }[];
            commitEdits?: boolean;
            filters?: import(".").FilterModel;
            filterDisplay?: "row" | "menu" | null;
            globalFilterFields?: string[];
            showGlobalFilter?: boolean;
            globalFilterPlaceholder?: string;
            maxConstraints?: number;
            groupRowsBy?: string;
            rowGroupMode?: "subheader" | "rowspan";
            expandableRowGroups?: boolean;
            expandedRowGroups?: string[];
            showGroupFooter?: boolean;
            expandedRows?: {
                [x: string]: unknown;
            }[];
            rowExpansion?: boolean;
            expandOnRowClick?: boolean;
            singleExpand?: boolean;
            expandIcon?: string;
            collapseIcon?: string;
            frozenValue?: {
                [x: string]: unknown;
            }[];
            rowFreeze?: boolean;
            freezeIcon?: string;
            unfreezeIcon?: string;
            showFooter?: boolean;
            footerMode?: "all" | "selected" | "both";
            loading?: boolean;
            loadingMode?: "overlay" | "skeleton";
            skeletonRows?: number;
            emptyMessage?: string;
            rowClass?: (row: {
                [x: string]: unknown;
            }, index: number) => string | undefined;
            rowStyle?: (row: {
                [x: string]: unknown;
            }, index: number) => Record<string, string> | undefined;
            hoverable?: boolean;
            rowRipple?: boolean;
            locale?: string;
            caption?: string;
            columnState?: import("./components/ApexDataTable.vue").ColumnState;
            resizableColumns?: boolean;
            columnResizeMode?: "fit" | "expand";
            reorderableColumns?: boolean;
            columnToggle?: boolean;
            columnToggleLabel?: string;
            columnGroups?: import("./components/ApexDataTable.vue").ColumnGroup[];
            stateKey?: string;
            stateStorage?: "local" | "session";
        }> & Readonly<{
            onSort?: ((payload: {
                sortField?: string;
                sortOrder: import(".").SortOrder;
                multiSortMeta: import(".").SortMeta[];
            }) => any) | undefined;
            onFilter?: ((payload: {
                filters: import(".").FilterModel;
                filteredValue: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
            "onUpdate:selection"?: ((v: {
                [x: string]: unknown;
            } | {
                [x: string]: unknown;
            }[] | null) => any) | undefined;
            "onUpdate:first"?: ((v: number) => any) | undefined;
            "onUpdate:rows"?: ((v: number) => any) | undefined;
            onPage?: ((payload: {
                first: number;
                rows: number;
                page: number;
            }) => any) | undefined;
            "onUpdate:columnState"?: ((v: import("./components/ApexDataTable.vue").ColumnState) => any) | undefined;
            "onColumn-resize"?: ((payload: {
                field: string;
                width?: number;
            }) => any) | undefined;
            "onColumn-reorder"?: ((payload: {
                field: string;
                fromIndex: number;
                toIndex: number;
            }) => any) | undefined;
            "onColumn-toggle"?: ((payload: {
                field: string;
                hidden: boolean;
            }) => any) | undefined;
            "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
            "onUpdate:sortOrder"?: ((v: import(".").SortOrder) => any) | undefined;
            "onUpdate:multiSortMeta"?: ((v: import(".").SortMeta[]) => any) | undefined;
            "onRow-select"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any) | undefined;
            "onRow-unselect"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any) | undefined;
            "onRow-click"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
                event: MouseEvent;
            }) => any) | undefined;
            "onUpdate:frozenValue"?: ((v: {
                [x: string]: unknown;
            }[]) => any) | undefined;
            "onRow-freeze"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => any) | undefined;
            "onRow-unfreeze"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => any) | undefined;
            "onUpdate:expandedRows"?: ((v: {
                [x: string]: unknown;
            }[]) => any) | undefined;
            "onRow-expand"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => any) | undefined;
            "onRow-collapse"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => any) | undefined;
            "onUpdate:filters"?: ((v: import(".").FilterModel) => any) | undefined;
            "onUpdate:expandedRowGroups"?: ((v: string[]) => any) | undefined;
            "onRowgroup-expand"?: ((payload: {
                key: string;
            }) => any) | undefined;
            "onRowgroup-collapse"?: ((payload: {
                key: string;
            }) => any) | undefined;
            "onUpdate:editingRows"?: ((v: {
                [x: string]: unknown;
            }[]) => any) | undefined;
            "onCell-edit-init"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                field: string;
                value: unknown;
            }) => any) | undefined;
            "onCell-edit-complete"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                field: string;
                value: unknown;
                newValue: unknown;
            }) => any) | undefined;
            "onCell-edit-cancel"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                field: string;
            }) => any) | undefined;
            "onRow-edit-init"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any) | undefined;
            "onRow-edit-cancel"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any) | undefined;
            "onRow-edit-save"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                newData: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any) | undefined;
        }>, {
            focusRow: (i: number) => void;
            selectRow: (row: {
                [x: string]: unknown;
            }, index: number, event?: MouseEvent) => void;
            toggleAllOnPage: () => void;
            setFilter: (field: string, meta: import(".").FilterMeta) => void;
            clearFilter: (field: string) => void;
            clearAllFilters: () => void;
            toggleGroup: (key: string) => void;
            toggleExpand: (row: {
                [x: string]: unknown;
            }) => void;
            toggleFreeze: (row: {
                [x: string]: unknown;
            }) => void;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:columnState": (v: import("./components/ApexDataTable.vue").ColumnState) => void;
            "column-resize": (payload: {
                field: string;
                width?: number;
            }) => void;
            "column-reorder": (payload: {
                field: string;
                fromIndex: number;
                toIndex: number;
            }) => void;
            "column-toggle": (payload: {
                field: string;
                hidden: boolean;
            }) => void;
            "update:selection": (v: {
                [x: string]: unknown;
            } | {
                [x: string]: unknown;
            }[] | null) => void;
            "update:first": (v: number) => void;
            "update:rows": (v: number) => void;
            "update:sortField": (v: string | undefined) => void;
            "update:sortOrder": (v: import(".").SortOrder) => void;
            "update:multiSortMeta": (v: import(".").SortMeta[]) => void;
            "row-select": (payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => void;
            "row-unselect": (payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => void;
            "row-click": (payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
                event: MouseEvent;
            }) => void;
            sort: (payload: {
                sortField?: string;
                sortOrder: import(".").SortOrder;
                multiSortMeta: import(".").SortMeta[];
            }) => void;
            page: (payload: {
                first: number;
                rows: number;
                page: number;
            }) => void;
            "update:frozenValue": (v: {
                [x: string]: unknown;
            }[]) => void;
            "row-freeze": (payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => void;
            "row-unfreeze": (payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => void;
            "update:expandedRows": (v: {
                [x: string]: unknown;
            }[]) => void;
            "row-expand": (payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => void;
            "row-collapse": (payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => void;
            "update:filters": (v: import(".").FilterModel) => void;
            filter: (payload: {
                filters: import(".").FilterModel;
                filteredValue: {
                    [x: string]: unknown;
                }[];
            }) => void;
            "update:expandedRowGroups": (v: string[]) => void;
            "rowgroup-expand": (payload: {
                key: string;
            }) => void;
            "rowgroup-collapse": (payload: {
                key: string;
            }) => void;
            "update:editingRows": (v: {
                [x: string]: unknown;
            }[]) => void;
            "cell-edit-init": (payload: {
                data: {
                    [x: string]: unknown;
                };
                field: string;
                value: unknown;
            }) => void;
            "cell-edit-complete": (payload: {
                data: {
                    [x: string]: unknown;
                };
                field: string;
                value: unknown;
                newValue: unknown;
            }) => void;
            "cell-edit-cancel": (payload: {
                data: {
                    [x: string]: unknown;
                };
                field: string;
            }) => void;
            "row-edit-init": (payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => void;
            "row-edit-cancel": (payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => void;
            "row-edit-save": (payload: {
                data: {
                    [x: string]: unknown;
                };
                newData: {
                    [x: string]: unknown;
                };
                index: number;
            }) => void;
        }, import("vue").PublicProps, {
            size: "small" | "normal" | "large";
            rows: number;
            selectionMode: "single" | "multiple" | "checkbox" | "radio" | null;
            first: number;
            maxConstraints: number;
            gridLines: "none" | "both" | "horizontal" | "vertical";
            gridLineSize: number;
            striped: boolean;
            bordered: boolean;
            metaKeySelection: boolean;
            sortMode: "single" | "multiple";
            removableSort: boolean;
            paginatorTemplate: string;
            editMode: "cell" | "row" | null;
            commitEdits: boolean;
            filterDisplay: "row" | "menu" | null;
            globalFilterPlaceholder: string;
            rowGroupMode: "subheader" | "rowspan";
            expandIcon: string;
            collapseIcon: string;
            freezeIcon: string;
            unfreezeIcon: string;
            footerMode: "all" | "selected" | "both";
            loadingMode: "overlay" | "skeleton";
            skeletonRows: number;
            hoverable: boolean;
            columnResizeMode: "fit" | "expand";
            columnToggleLabel: string;
            stateStorage: "local" | "session";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            ui?: import("./types").ApexDataTableClasses;
            value?: {
                [x: string]: unknown;
            }[];
            columns?: import(".").ColumnDef[];
            dataKey?: string;
            size?: "small" | "normal" | "large";
            gridLines?: "none" | "both" | "horizontal" | "vertical";
            gridLineSize?: number;
            gridLineColor?: string;
            striped?: boolean;
            stripeColor?: string;
            borderColor?: string;
            headerBackground?: string;
            bordered?: boolean;
            selection?: {
                [x: string]: unknown;
            } | {
                [x: string]: unknown;
            }[] | null;
            selectionMode?: "single" | "multiple" | "checkbox" | "radio" | null;
            selectionColor?: string;
            showSelectionCount?: boolean;
            metaKeySelection?: boolean;
            sortMode?: "single" | "multiple";
            sortField?: string;
            sortOrder?: import(".").SortOrder;
            multiSortMeta?: import(".").SortMeta[];
            removableSort?: boolean;
            paginator?: boolean;
            rows?: number;
            first?: number;
            rowsPerPageOptions?: number[];
            paginatorTemplate?: string;
            lazy?: boolean;
            totalRecords?: number;
            scrollable?: boolean;
            scrollHeight?: string;
            flexible?: boolean;
            tableMinWidth?: string;
            editMode?: "cell" | "row" | null;
            editingRows?: {
                [x: string]: unknown;
            }[];
            commitEdits?: boolean;
            filters?: import(".").FilterModel;
            filterDisplay?: "row" | "menu" | null;
            globalFilterFields?: string[];
            showGlobalFilter?: boolean;
            globalFilterPlaceholder?: string;
            maxConstraints?: number;
            groupRowsBy?: string;
            rowGroupMode?: "subheader" | "rowspan";
            expandableRowGroups?: boolean;
            expandedRowGroups?: string[];
            showGroupFooter?: boolean;
            expandedRows?: {
                [x: string]: unknown;
            }[];
            rowExpansion?: boolean;
            expandOnRowClick?: boolean;
            singleExpand?: boolean;
            expandIcon?: string;
            collapseIcon?: string;
            frozenValue?: {
                [x: string]: unknown;
            }[];
            rowFreeze?: boolean;
            freezeIcon?: string;
            unfreezeIcon?: string;
            showFooter?: boolean;
            footerMode?: "all" | "selected" | "both";
            loading?: boolean;
            loadingMode?: "overlay" | "skeleton";
            skeletonRows?: number;
            emptyMessage?: string;
            rowClass?: (row: {
                [x: string]: unknown;
            }, index: number) => string | undefined;
            rowStyle?: (row: {
                [x: string]: unknown;
            }, index: number) => Record<string, string> | undefined;
            hoverable?: boolean;
            rowRipple?: boolean;
            locale?: string;
            caption?: string;
            columnState?: import("./components/ApexDataTable.vue").ColumnState;
            resizableColumns?: boolean;
            columnResizeMode?: "fit" | "expand";
            reorderableColumns?: boolean;
            columnToggle?: boolean;
            columnToggleLabel?: string;
            columnGroups?: import("./components/ApexDataTable.vue").ColumnGroup[];
            stateKey?: string;
            stateStorage?: "local" | "session";
        }> & Readonly<{
            onSort?: ((payload: {
                sortField?: string;
                sortOrder: import(".").SortOrder;
                multiSortMeta: import(".").SortMeta[];
            }) => any) | undefined;
            onFilter?: ((payload: {
                filters: import(".").FilterModel;
                filteredValue: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
            "onUpdate:selection"?: ((v: {
                [x: string]: unknown;
            } | {
                [x: string]: unknown;
            }[] | null) => any) | undefined;
            "onUpdate:first"?: ((v: number) => any) | undefined;
            "onUpdate:rows"?: ((v: number) => any) | undefined;
            onPage?: ((payload: {
                first: number;
                rows: number;
                page: number;
            }) => any) | undefined;
            "onUpdate:columnState"?: ((v: import("./components/ApexDataTable.vue").ColumnState) => any) | undefined;
            "onColumn-resize"?: ((payload: {
                field: string;
                width?: number;
            }) => any) | undefined;
            "onColumn-reorder"?: ((payload: {
                field: string;
                fromIndex: number;
                toIndex: number;
            }) => any) | undefined;
            "onColumn-toggle"?: ((payload: {
                field: string;
                hidden: boolean;
            }) => any) | undefined;
            "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
            "onUpdate:sortOrder"?: ((v: import(".").SortOrder) => any) | undefined;
            "onUpdate:multiSortMeta"?: ((v: import(".").SortMeta[]) => any) | undefined;
            "onRow-select"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any) | undefined;
            "onRow-unselect"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any) | undefined;
            "onRow-click"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
                event: MouseEvent;
            }) => any) | undefined;
            "onUpdate:frozenValue"?: ((v: {
                [x: string]: unknown;
            }[]) => any) | undefined;
            "onRow-freeze"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => any) | undefined;
            "onRow-unfreeze"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => any) | undefined;
            "onUpdate:expandedRows"?: ((v: {
                [x: string]: unknown;
            }[]) => any) | undefined;
            "onRow-expand"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => any) | undefined;
            "onRow-collapse"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
            }) => any) | undefined;
            "onUpdate:filters"?: ((v: import(".").FilterModel) => any) | undefined;
            "onUpdate:expandedRowGroups"?: ((v: string[]) => any) | undefined;
            "onRowgroup-expand"?: ((payload: {
                key: string;
            }) => any) | undefined;
            "onRowgroup-collapse"?: ((payload: {
                key: string;
            }) => any) | undefined;
            "onUpdate:editingRows"?: ((v: {
                [x: string]: unknown;
            }[]) => any) | undefined;
            "onCell-edit-init"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                field: string;
                value: unknown;
            }) => any) | undefined;
            "onCell-edit-complete"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                field: string;
                value: unknown;
                newValue: unknown;
            }) => any) | undefined;
            "onCell-edit-cancel"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                field: string;
            }) => any) | undefined;
            "onRow-edit-init"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any) | undefined;
            "onRow-edit-cancel"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any) | undefined;
            "onRow-edit-save"?: ((payload: {
                data: {
                    [x: string]: unknown;
                };
                newData: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any) | undefined;
        }>, {
            focusRow: (i: number) => void;
            selectRow: (row: {
                [x: string]: unknown;
            }, index: number, event?: MouseEvent) => void;
            toggleAllOnPage: () => void;
            setFilter: (field: string, meta: import(".").FilterMeta) => void;
            clearFilter: (field: string) => void;
            clearAllFilters: () => void;
            toggleGroup: (key: string) => void;
            toggleExpand: (row: {
                [x: string]: unknown;
            }) => void;
            toggleFreeze: (row: {
                [x: string]: unknown;
            }) => void;
        }, {}, {}, {}, {
            size: "small" | "normal" | "large";
            rows: number;
            selectionMode: "single" | "multiple" | "checkbox" | "radio" | null;
            first: number;
            maxConstraints: number;
            gridLines: "none" | "both" | "horizontal" | "vertical";
            gridLineSize: number;
            striped: boolean;
            bordered: boolean;
            metaKeySelection: boolean;
            sortMode: "single" | "multiple";
            removableSort: boolean;
            paginatorTemplate: string;
            editMode: "cell" | "row" | null;
            commitEdits: boolean;
            filterDisplay: "row" | "menu" | null;
            globalFilterPlaceholder: string;
            rowGroupMode: "subheader" | "rowspan";
            expandIcon: string;
            collapseIcon: string;
            freezeIcon: string;
            unfreezeIcon: string;
            footerMode: "all" | "selected" | "both";
            loadingMode: "overlay" | "skeleton";
            skeletonRows: number;
            hoverable: boolean;
            columnResizeMode: "fit" | "expand";
            columnToggleLabel: string;
            stateStorage: "local" | "session";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        ui?: import("./types").ApexDataTableClasses;
        value?: {
            [x: string]: unknown;
        }[];
        columns?: import(".").ColumnDef[];
        dataKey?: string;
        size?: "small" | "normal" | "large";
        gridLines?: "none" | "both" | "horizontal" | "vertical";
        gridLineSize?: number;
        gridLineColor?: string;
        striped?: boolean;
        stripeColor?: string;
        borderColor?: string;
        headerBackground?: string;
        bordered?: boolean;
        selection?: {
            [x: string]: unknown;
        } | {
            [x: string]: unknown;
        }[] | null;
        selectionMode?: "single" | "multiple" | "checkbox" | "radio" | null;
        selectionColor?: string;
        showSelectionCount?: boolean;
        metaKeySelection?: boolean;
        sortMode?: "single" | "multiple";
        sortField?: string;
        sortOrder?: import(".").SortOrder;
        multiSortMeta?: import(".").SortMeta[];
        removableSort?: boolean;
        paginator?: boolean;
        rows?: number;
        first?: number;
        rowsPerPageOptions?: number[];
        paginatorTemplate?: string;
        lazy?: boolean;
        totalRecords?: number;
        scrollable?: boolean;
        scrollHeight?: string;
        flexible?: boolean;
        tableMinWidth?: string;
        editMode?: "cell" | "row" | null;
        editingRows?: {
            [x: string]: unknown;
        }[];
        commitEdits?: boolean;
        filters?: import(".").FilterModel;
        filterDisplay?: "row" | "menu" | null;
        globalFilterFields?: string[];
        showGlobalFilter?: boolean;
        globalFilterPlaceholder?: string;
        maxConstraints?: number;
        groupRowsBy?: string;
        rowGroupMode?: "subheader" | "rowspan";
        expandableRowGroups?: boolean;
        expandedRowGroups?: string[];
        showGroupFooter?: boolean;
        expandedRows?: {
            [x: string]: unknown;
        }[];
        rowExpansion?: boolean;
        expandOnRowClick?: boolean;
        singleExpand?: boolean;
        expandIcon?: string;
        collapseIcon?: string;
        frozenValue?: {
            [x: string]: unknown;
        }[];
        rowFreeze?: boolean;
        freezeIcon?: string;
        unfreezeIcon?: string;
        showFooter?: boolean;
        footerMode?: "all" | "selected" | "both";
        loading?: boolean;
        loadingMode?: "overlay" | "skeleton";
        skeletonRows?: number;
        emptyMessage?: string;
        rowClass?: (row: {
            [x: string]: unknown;
        }, index: number) => string | undefined;
        rowStyle?: (row: {
            [x: string]: unknown;
        }, index: number) => Record<string, string> | undefined;
        hoverable?: boolean;
        rowRipple?: boolean;
        locale?: string;
        caption?: string;
        columnState?: import("./components/ApexDataTable.vue").ColumnState;
        resizableColumns?: boolean;
        columnResizeMode?: "fit" | "expand";
        reorderableColumns?: boolean;
        columnToggle?: boolean;
        columnToggleLabel?: string;
        columnGroups?: import("./components/ApexDataTable.vue").ColumnGroup[];
        stateKey?: string;
        stateStorage?: "local" | "session";
    }> & Readonly<{
        onSort?: ((payload: {
            sortField?: string;
            sortOrder: import(".").SortOrder;
            multiSortMeta: import(".").SortMeta[];
        }) => any) | undefined;
        onFilter?: ((payload: {
            filters: import(".").FilterModel;
            filteredValue: {
                [x: string]: unknown;
            }[];
        }) => any) | undefined;
        "onUpdate:selection"?: ((v: {
            [x: string]: unknown;
        } | {
            [x: string]: unknown;
        }[] | null) => any) | undefined;
        "onUpdate:first"?: ((v: number) => any) | undefined;
        "onUpdate:rows"?: ((v: number) => any) | undefined;
        onPage?: ((payload: {
            first: number;
            rows: number;
            page: number;
        }) => any) | undefined;
        "onUpdate:columnState"?: ((v: import("./components/ApexDataTable.vue").ColumnState) => any) | undefined;
        "onColumn-resize"?: ((payload: {
            field: string;
            width?: number;
        }) => any) | undefined;
        "onColumn-reorder"?: ((payload: {
            field: string;
            fromIndex: number;
            toIndex: number;
        }) => any) | undefined;
        "onColumn-toggle"?: ((payload: {
            field: string;
            hidden: boolean;
        }) => any) | undefined;
        "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
        "onUpdate:sortOrder"?: ((v: import(".").SortOrder) => any) | undefined;
        "onUpdate:multiSortMeta"?: ((v: import(".").SortMeta[]) => any) | undefined;
        "onRow-select"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
            index: number;
        }) => any) | undefined;
        "onRow-unselect"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
            index: number;
        }) => any) | undefined;
        "onRow-click"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
            index: number;
            event: MouseEvent;
        }) => any) | undefined;
        "onUpdate:frozenValue"?: ((v: {
            [x: string]: unknown;
        }[]) => any) | undefined;
        "onRow-freeze"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
        }) => any) | undefined;
        "onRow-unfreeze"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
        }) => any) | undefined;
        "onUpdate:expandedRows"?: ((v: {
            [x: string]: unknown;
        }[]) => any) | undefined;
        "onRow-expand"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
        }) => any) | undefined;
        "onRow-collapse"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
        }) => any) | undefined;
        "onUpdate:filters"?: ((v: import(".").FilterModel) => any) | undefined;
        "onUpdate:expandedRowGroups"?: ((v: string[]) => any) | undefined;
        "onRowgroup-expand"?: ((payload: {
            key: string;
        }) => any) | undefined;
        "onRowgroup-collapse"?: ((payload: {
            key: string;
        }) => any) | undefined;
        "onUpdate:editingRows"?: ((v: {
            [x: string]: unknown;
        }[]) => any) | undefined;
        "onCell-edit-init"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
            field: string;
            value: unknown;
        }) => any) | undefined;
        "onCell-edit-complete"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
            field: string;
            value: unknown;
            newValue: unknown;
        }) => any) | undefined;
        "onCell-edit-cancel"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
            field: string;
        }) => any) | undefined;
        "onRow-edit-init"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
            index: number;
        }) => any) | undefined;
        "onRow-edit-cancel"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
            index: number;
        }) => any) | undefined;
        "onRow-edit-save"?: ((payload: {
            data: {
                [x: string]: unknown;
            };
            newData: {
                [x: string]: unknown;
            };
            index: number;
        }) => any) | undefined;
    }>, {
        focusRow: (i: number) => void;
        selectRow: (row: {
            [x: string]: unknown;
        }, index: number, event?: MouseEvent) => void;
        toggleAllOnPage: () => void;
        setFilter: (field: string, meta: import(".").FilterMeta) => void;
        clearFilter: (field: string) => void;
        clearAllFilters: () => void;
        toggleGroup: (key: string) => void;
        toggleExpand: (row: {
            [x: string]: unknown;
        }) => void;
        toggleFreeze: (row: {
            [x: string]: unknown;
        }) => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:columnState": (v: import("./components/ApexDataTable.vue").ColumnState) => void;
        "column-resize": (payload: {
            field: string;
            width?: number;
        }) => void;
        "column-reorder": (payload: {
            field: string;
            fromIndex: number;
            toIndex: number;
        }) => void;
        "column-toggle": (payload: {
            field: string;
            hidden: boolean;
        }) => void;
        "update:selection": (v: {
            [x: string]: unknown;
        } | {
            [x: string]: unknown;
        }[] | null) => void;
        "update:first": (v: number) => void;
        "update:rows": (v: number) => void;
        "update:sortField": (v: string | undefined) => void;
        "update:sortOrder": (v: import(".").SortOrder) => void;
        "update:multiSortMeta": (v: import(".").SortMeta[]) => void;
        "row-select": (payload: {
            data: {
                [x: string]: unknown;
            };
            index: number;
        }) => void;
        "row-unselect": (payload: {
            data: {
                [x: string]: unknown;
            };
            index: number;
        }) => void;
        "row-click": (payload: {
            data: {
                [x: string]: unknown;
            };
            index: number;
            event: MouseEvent;
        }) => void;
        sort: (payload: {
            sortField?: string;
            sortOrder: import(".").SortOrder;
            multiSortMeta: import(".").SortMeta[];
        }) => void;
        page: (payload: {
            first: number;
            rows: number;
            page: number;
        }) => void;
        "update:frozenValue": (v: {
            [x: string]: unknown;
        }[]) => void;
        "row-freeze": (payload: {
            data: {
                [x: string]: unknown;
            };
        }) => void;
        "row-unfreeze": (payload: {
            data: {
                [x: string]: unknown;
            };
        }) => void;
        "update:expandedRows": (v: {
            [x: string]: unknown;
        }[]) => void;
        "row-expand": (payload: {
            data: {
                [x: string]: unknown;
            };
        }) => void;
        "row-collapse": (payload: {
            data: {
                [x: string]: unknown;
            };
        }) => void;
        "update:filters": (v: import(".").FilterModel) => void;
        filter: (payload: {
            filters: import(".").FilterModel;
            filteredValue: {
                [x: string]: unknown;
            }[];
        }) => void;
        "update:expandedRowGroups": (v: string[]) => void;
        "rowgroup-expand": (payload: {
            key: string;
        }) => void;
        "rowgroup-collapse": (payload: {
            key: string;
        }) => void;
        "update:editingRows": (v: {
            [x: string]: unknown;
        }[]) => void;
        "cell-edit-init": (payload: {
            data: {
                [x: string]: unknown;
            };
            field: string;
            value: unknown;
        }) => void;
        "cell-edit-complete": (payload: {
            data: {
                [x: string]: unknown;
            };
            field: string;
            value: unknown;
            newValue: unknown;
        }) => void;
        "cell-edit-cancel": (payload: {
            data: {
                [x: string]: unknown;
            };
            field: string;
        }) => void;
        "row-edit-init": (payload: {
            data: {
                [x: string]: unknown;
            };
            index: number;
        }) => void;
        "row-edit-cancel": (payload: {
            data: {
                [x: string]: unknown;
            };
            index: number;
        }) => void;
        "row-edit-save": (payload: {
            data: {
                [x: string]: unknown;
            };
            newData: {
                [x: string]: unknown;
            };
            index: number;
        }) => void;
    }, string, {
        size: "small" | "normal" | "large";
        rows: number;
        selectionMode: "single" | "multiple" | "checkbox" | "radio" | null;
        first: number;
        maxConstraints: number;
        gridLines: "none" | "both" | "horizontal" | "vertical";
        gridLineSize: number;
        striped: boolean;
        bordered: boolean;
        metaKeySelection: boolean;
        sortMode: "single" | "multiple";
        removableSort: boolean;
        paginatorTemplate: string;
        editMode: "cell" | "row" | null;
        commitEdits: boolean;
        filterDisplay: "row" | "menu" | null;
        globalFilterPlaceholder: string;
        rowGroupMode: "subheader" | "rowspan";
        expandIcon: string;
        collapseIcon: string;
        freezeIcon: string;
        unfreezeIcon: string;
        footerMode: "all" | "selected" | "both";
        loadingMode: "overlay" | "skeleton";
        skeletonRows: number;
        hoverable: boolean;
        columnResizeMode: "fit" | "expand";
        columnToggleLabel: string;
        stateStorage: "local" | "session";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            [x: `header:${string}`]: ((props: {
                column: import(".").ColumnDef & {
                    __key: string;
                };
            }) => any) | undefined;
        } & {
            [x: `header:${string}`]: ((props: {
                column: import(".").ColumnDef & {
                    __key: string;
                };
            }) => any) | undefined;
        } & {
            [x: `cell:${string}`]: ((props: {
                row: {
                    [x: string]: unknown;
                };
                column: import(".").ColumnDef & {
                    __key: string;
                };
                value: unknown;
            }) => any) | undefined;
        } & {
            [x: `editor:${string}`]: ((props: {
                row: {
                    [x: string]: unknown;
                };
                column: import(".").ColumnDef & {
                    __key: string;
                };
                value: unknown;
                update: (v: unknown) => void;
            }) => any) | undefined;
        } & {
            [x: `cell:${string}`]: ((props: {
                row: {
                    [x: string]: unknown;
                };
                column: import(".").ColumnDef & {
                    __key: string;
                };
                value: unknown;
                index: number;
            }) => any) | undefined;
        } & {
            header?: (props: {}) => any;
        } & {
            filterRow?: (props: {}) => any;
        } & {
            groupheader?: (props: {
                value: unknown;
                rows: Record<string, unknown>[];
                key: string;
            }) => any;
        } & {
            groupfooter?: (props: {
                value: unknown;
                rows: Record<string, unknown>[];
                column: import(".").ColumnDef & {
                    __key: string;
                };
            }) => any;
        } & {
            expansion?: (props: {
                row: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any;
        } & {
            empty?: (props: {}) => any;
        } & {
            loading?: (props: {}) => any;
        } & {
            footer?: (props: {}) => any;
        };
    });
    Paginator: import("vue").DefineComponent<{
        ui?: import("./types").ApexPaginatorClasses;
        first?: number;
        rows?: number;
        totalRecords?: number;
        rowsPerPageOptions?: number[];
        pageLinks?: number;
        template?: string;
        disabled?: boolean;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "update:first": (v: number) => any;
        "update:rows": (v: number) => any;
        page: (payload: {
            first: number;
            rows: number;
            page: number;
        }) => any;
    }, string, import("vue").PublicProps, Readonly<{
        ui?: import("./types").ApexPaginatorClasses;
        first?: number;
        rows?: number;
        totalRecords?: number;
        rowsPerPageOptions?: number[];
        pageLinks?: number;
        template?: string;
        disabled?: boolean;
    }> & Readonly<{
        "onUpdate:first"?: ((v: number) => any) | undefined;
        "onUpdate:rows"?: ((v: number) => any) | undefined;
        onPage?: ((payload: {
            first: number;
            rows: number;
            page: number;
        }) => any) | undefined;
    }>, {
        template: string;
        rows: number;
        first: number;
        totalRecords: number;
        pageLinks: number;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    DataView: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            ui?: import("./types").ApexDataViewClasses;
            value?: {
                [x: string]: unknown;
            }[];
            dataKey?: string;
            layout?: "list" | "grid";
            showLayoutSwitcher?: boolean;
            sortField?: string;
            sortOrder?: import(".").SortOrder;
            sortOptions?: Array<{
                label: string;
                field: string;
                order: import(".").SortOrder;
            }>;
            sortPlaceholder?: string;
            paginator?: boolean;
            rows?: number;
            first?: number;
            rowsPerPageOptions?: number[];
            paginatorTemplate?: string;
            lazy?: boolean;
            totalRecords?: number;
            gridMinWidth?: string;
            gap?: string;
            bordered?: boolean;
            caption?: string;
            loading?: boolean;
            loadingMode?: "overlay" | "skeleton";
            skeletonCount?: number;
            emptyMessage?: string;
        }> & Readonly<{
            onSort?: ((payload: {
                sortField?: string;
                sortOrder: import(".").SortOrder;
            }) => any) | undefined;
            "onUpdate:first"?: ((v: number) => any) | undefined;
            "onUpdate:rows"?: ((v: number) => any) | undefined;
            onPage?: ((payload: {
                first: number;
                rows: number;
                page: number;
            }) => any) | undefined;
            "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
            "onUpdate:sortOrder"?: ((v: import(".").SortOrder) => any) | undefined;
            "onUpdate:layout"?: ((v: "list" | "grid") => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            sort: (payload: {
                sortField?: string;
                sortOrder: import(".").SortOrder;
            }) => any;
            "update:first": (v: number) => any;
            "update:rows": (v: number) => any;
            page: (payload: {
                first: number;
                rows: number;
                page: number;
            }) => any;
            "update:sortField": (v: string | undefined) => any;
            "update:sortOrder": (v: import(".").SortOrder) => any;
            "update:layout": (v: "list" | "grid") => any;
        }, import("vue").PublicProps, {
            rows: number;
            gap: string;
            first: number;
            bordered: boolean;
            paginatorTemplate: string;
            loadingMode: "overlay" | "skeleton";
            layout: "list" | "grid";
            sortPlaceholder: string;
            gridMinWidth: string;
            skeletonCount: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            ui?: import("./types").ApexDataViewClasses;
            value?: {
                [x: string]: unknown;
            }[];
            dataKey?: string;
            layout?: "list" | "grid";
            showLayoutSwitcher?: boolean;
            sortField?: string;
            sortOrder?: import(".").SortOrder;
            sortOptions?: Array<{
                label: string;
                field: string;
                order: import(".").SortOrder;
            }>;
            sortPlaceholder?: string;
            paginator?: boolean;
            rows?: number;
            first?: number;
            rowsPerPageOptions?: number[];
            paginatorTemplate?: string;
            lazy?: boolean;
            totalRecords?: number;
            gridMinWidth?: string;
            gap?: string;
            bordered?: boolean;
            caption?: string;
            loading?: boolean;
            loadingMode?: "overlay" | "skeleton";
            skeletonCount?: number;
            emptyMessage?: string;
        }> & Readonly<{
            onSort?: ((payload: {
                sortField?: string;
                sortOrder: import(".").SortOrder;
            }) => any) | undefined;
            "onUpdate:first"?: ((v: number) => any) | undefined;
            "onUpdate:rows"?: ((v: number) => any) | undefined;
            onPage?: ((payload: {
                first: number;
                rows: number;
                page: number;
            }) => any) | undefined;
            "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
            "onUpdate:sortOrder"?: ((v: import(".").SortOrder) => any) | undefined;
            "onUpdate:layout"?: ((v: "list" | "grid") => any) | undefined;
        }>, {}, {}, {}, {}, {
            rows: number;
            gap: string;
            first: number;
            bordered: boolean;
            paginatorTemplate: string;
            loadingMode: "overlay" | "skeleton";
            layout: "list" | "grid";
            sortPlaceholder: string;
            gridMinWidth: string;
            skeletonCount: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        ui?: import("./types").ApexDataViewClasses;
        value?: {
            [x: string]: unknown;
        }[];
        dataKey?: string;
        layout?: "list" | "grid";
        showLayoutSwitcher?: boolean;
        sortField?: string;
        sortOrder?: import(".").SortOrder;
        sortOptions?: Array<{
            label: string;
            field: string;
            order: import(".").SortOrder;
        }>;
        sortPlaceholder?: string;
        paginator?: boolean;
        rows?: number;
        first?: number;
        rowsPerPageOptions?: number[];
        paginatorTemplate?: string;
        lazy?: boolean;
        totalRecords?: number;
        gridMinWidth?: string;
        gap?: string;
        bordered?: boolean;
        caption?: string;
        loading?: boolean;
        loadingMode?: "overlay" | "skeleton";
        skeletonCount?: number;
        emptyMessage?: string;
    }> & Readonly<{
        onSort?: ((payload: {
            sortField?: string;
            sortOrder: import(".").SortOrder;
        }) => any) | undefined;
        "onUpdate:first"?: ((v: number) => any) | undefined;
        "onUpdate:rows"?: ((v: number) => any) | undefined;
        onPage?: ((payload: {
            first: number;
            rows: number;
            page: number;
        }) => any) | undefined;
        "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
        "onUpdate:sortOrder"?: ((v: import(".").SortOrder) => any) | undefined;
        "onUpdate:layout"?: ((v: "list" | "grid") => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        sort: (payload: {
            sortField?: string;
            sortOrder: import(".").SortOrder;
        }) => any;
        "update:first": (v: number) => any;
        "update:rows": (v: number) => any;
        page: (payload: {
            first: number;
            rows: number;
            page: number;
        }) => any;
        "update:sortField": (v: string | undefined) => any;
        "update:sortOrder": (v: import(".").SortOrder) => any;
        "update:layout": (v: "list" | "grid") => any;
    }, string, {
        rows: number;
        gap: string;
        first: number;
        bordered: boolean;
        paginatorTemplate: string;
        loadingMode: "overlay" | "skeleton";
        layout: "list" | "grid";
        sortPlaceholder: string;
        gridMinWidth: string;
        skeletonCount: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            header?: (props: {}) => any;
        } & {
            skeleton?: (props: {}) => any;
        } & {
            grid?: (props: {
                item: Record<string, unknown>;
                index: number;
                layout: "grid";
            }) => any;
        } & {
            item?: (props: {
                item: Record<string, unknown>;
                index: number;
                layout: "grid";
            }) => any;
        } & {
            list?: (props: {
                item: Record<string, unknown>;
                index: number;
                layout: "list";
            }) => any;
        } & {
            item?: (props: {
                item: Record<string, unknown>;
                index: number;
                layout: "list";
            }) => any;
        } & {
            empty?: (props: {}) => any;
        } & {
            loading?: (props: {}) => any;
        } & {
            footer?: (props: {}) => any;
        };
    });
    OrgChart: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            ui?: import("./types").ApexOrgChartClasses;
            value?: import(".").OrgNode | import(".").OrgNode[];
            collapsible?: boolean;
            collapsedKeys?: Record<string, boolean>;
            selectionMode?: "single" | "multiple" | "checkbox" | null;
            selectionKeys?: Record<string, boolean>;
            orientation?: "vertical" | "horizontal";
            lineColor?: string;
            lineWidth?: number;
            nodeBackground?: string;
            nodeColor?: string;
            nodeBorderColor?: string;
            nodeBorderWidth?: number;
            nodeRadius?: string;
            selectedBackground?: string;
            selectedColor?: string;
            selectedBorderColor?: string;
            partialBorderColor?: string;
            nodeGap?: string;
            levelGap?: string;
        }> & Readonly<{
            "onNode-expand"?: ((node: import(".").OrgNode) => any) | undefined;
            "onNode-collapse"?: ((node: import(".").OrgNode) => any) | undefined;
            "onUpdate:collapsedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
            "onUpdate:selectionKeys"?: ((v: Record<string, boolean>) => any) | undefined;
            "onNode-select"?: ((node: import(".").OrgNode) => any) | undefined;
            "onNode-unselect"?: ((node: import(".").OrgNode) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:collapsedKeys": (v: Record<string, boolean>) => void;
            "update:selectionKeys": (v: Record<string, boolean>) => void;
            "node-expand": (node: import(".").OrgNode) => void;
            "node-collapse": (node: import(".").OrgNode) => void;
            "node-select": (node: import(".").OrgNode) => void;
            "node-unselect": (node: import(".").OrgNode) => void;
        }, import("vue").PublicProps, {
            selectionMode: "single" | "multiple" | "checkbox" | null;
            orientation: "vertical" | "horizontal";
            collapsible: boolean;
            lineWidth: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            ui?: import("./types").ApexOrgChartClasses;
            value?: import(".").OrgNode | import(".").OrgNode[];
            collapsible?: boolean;
            collapsedKeys?: Record<string, boolean>;
            selectionMode?: "single" | "multiple" | "checkbox" | null;
            selectionKeys?: Record<string, boolean>;
            orientation?: "vertical" | "horizontal";
            lineColor?: string;
            lineWidth?: number;
            nodeBackground?: string;
            nodeColor?: string;
            nodeBorderColor?: string;
            nodeBorderWidth?: number;
            nodeRadius?: string;
            selectedBackground?: string;
            selectedColor?: string;
            selectedBorderColor?: string;
            partialBorderColor?: string;
            nodeGap?: string;
            levelGap?: string;
        }> & Readonly<{
            "onNode-expand"?: ((node: import(".").OrgNode) => any) | undefined;
            "onNode-collapse"?: ((node: import(".").OrgNode) => any) | undefined;
            "onUpdate:collapsedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
            "onUpdate:selectionKeys"?: ((v: Record<string, boolean>) => any) | undefined;
            "onNode-select"?: ((node: import(".").OrgNode) => any) | undefined;
            "onNode-unselect"?: ((node: import(".").OrgNode) => any) | undefined;
        }>, {}, {}, {}, {}, {
            selectionMode: "single" | "multiple" | "checkbox" | null;
            orientation: "vertical" | "horizontal";
            collapsible: boolean;
            lineWidth: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        ui?: import("./types").ApexOrgChartClasses;
        value?: import(".").OrgNode | import(".").OrgNode[];
        collapsible?: boolean;
        collapsedKeys?: Record<string, boolean>;
        selectionMode?: "single" | "multiple" | "checkbox" | null;
        selectionKeys?: Record<string, boolean>;
        orientation?: "vertical" | "horizontal";
        lineColor?: string;
        lineWidth?: number;
        nodeBackground?: string;
        nodeColor?: string;
        nodeBorderColor?: string;
        nodeBorderWidth?: number;
        nodeRadius?: string;
        selectedBackground?: string;
        selectedColor?: string;
        selectedBorderColor?: string;
        partialBorderColor?: string;
        nodeGap?: string;
        levelGap?: string;
    }> & Readonly<{
        "onNode-expand"?: ((node: import(".").OrgNode) => any) | undefined;
        "onNode-collapse"?: ((node: import(".").OrgNode) => any) | undefined;
        "onUpdate:collapsedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
        "onUpdate:selectionKeys"?: ((v: Record<string, boolean>) => any) | undefined;
        "onNode-select"?: ((node: import(".").OrgNode) => any) | undefined;
        "onNode-unselect"?: ((node: import(".").OrgNode) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:collapsedKeys": (v: Record<string, boolean>) => void;
        "update:selectionKeys": (v: Record<string, boolean>) => void;
        "node-expand": (node: import(".").OrgNode) => void;
        "node-collapse": (node: import(".").OrgNode) => void;
        "node-select": (node: import(".").OrgNode) => void;
        "node-unselect": (node: import(".").OrgNode) => void;
    }, string, {
        selectionMode: "single" | "multiple" | "checkbox" | null;
        orientation: "vertical" | "horizontal";
        collapsible: boolean;
        lineWidth: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: any) => any;
        } & {
            toggleicon?: (props: any) => any;
        };
    });
    PickList: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            ui?: import("./types").ApexPickListClasses;
            modelValue?: [{
                [x: string]: unknown;
            }[], {
                [x: string]: unknown;
            }[]] | {
                [x: string]: unknown;
            }[][];
            dataKey?: string;
            sourceHeader?: string;
            targetHeader?: string;
            checkbox?: boolean;
            filter?: boolean;
            filterPlaceholder?: string;
            showSourceControls?: boolean;
            showTargetControls?: boolean;
            controlsPosition?: "outside" | "start" | "end";
            transferPosition?: "middle" | "end";
            stacked?: boolean;
            scrollHeight?: number;
            noDrag?: boolean;
            emptyMessage?: string;
            disabled?: boolean;
            borderColor?: string;
            borderWidth?: number;
            radius?: string;
            headerBackground?: string;
            headerColor?: string;
            listBackground?: string;
            itemColor?: string;
            selectedBackground?: string;
            selectedColor?: string;
            selectedBorderColor?: string;
            gap?: string;
        }> & Readonly<{
            "onUpdate:modelValue"?: ((v: {
                [x: string]: unknown;
            }[][]) => any) | undefined;
            onReorder?: ((payload: {
                side: 0 | 1;
                from: number;
                to: number;
            }) => any) | undefined;
            "onMove-to-target"?: ((payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
            "onMove-to-source"?: ((payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
            "onMove-all-to-target"?: ((payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
            "onMove-all-to-source"?: ((payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
            "onSelection-change"?: ((payload: {
                side: 0 | 1;
                items: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:modelValue": (v: {
                [x: string]: unknown;
            }[][]) => void;
            reorder: (payload: {
                side: 0 | 1;
                from: number;
                to: number;
            }) => void;
            "move-to-target": (payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => void;
            "move-to-source": (payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => void;
            "move-all-to-target": (payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => void;
            "move-all-to-source": (payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => void;
            "selection-change": (payload: {
                side: 0 | 1;
                items: {
                    [x: string]: unknown;
                }[];
            }) => void;
        }, import("vue").PublicProps, {
            scrollHeight: number;
            sourceHeader: string;
            targetHeader: string;
            showSourceControls: boolean;
            showTargetControls: boolean;
            controlsPosition: "outside" | "start" | "end";
            transferPosition: "middle" | "end";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            ui?: import("./types").ApexPickListClasses;
            modelValue?: [{
                [x: string]: unknown;
            }[], {
                [x: string]: unknown;
            }[]] | {
                [x: string]: unknown;
            }[][];
            dataKey?: string;
            sourceHeader?: string;
            targetHeader?: string;
            checkbox?: boolean;
            filter?: boolean;
            filterPlaceholder?: string;
            showSourceControls?: boolean;
            showTargetControls?: boolean;
            controlsPosition?: "outside" | "start" | "end";
            transferPosition?: "middle" | "end";
            stacked?: boolean;
            scrollHeight?: number;
            noDrag?: boolean;
            emptyMessage?: string;
            disabled?: boolean;
            borderColor?: string;
            borderWidth?: number;
            radius?: string;
            headerBackground?: string;
            headerColor?: string;
            listBackground?: string;
            itemColor?: string;
            selectedBackground?: string;
            selectedColor?: string;
            selectedBorderColor?: string;
            gap?: string;
        }> & Readonly<{
            "onUpdate:modelValue"?: ((v: {
                [x: string]: unknown;
            }[][]) => any) | undefined;
            onReorder?: ((payload: {
                side: 0 | 1;
                from: number;
                to: number;
            }) => any) | undefined;
            "onMove-to-target"?: ((payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
            "onMove-to-source"?: ((payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
            "onMove-all-to-target"?: ((payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
            "onMove-all-to-source"?: ((payload: {
                items: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
            "onSelection-change"?: ((payload: {
                side: 0 | 1;
                items: {
                    [x: string]: unknown;
                }[];
            }) => any) | undefined;
        }>, {}, {}, {}, {}, {
            scrollHeight: number;
            sourceHeader: string;
            targetHeader: string;
            showSourceControls: boolean;
            showTargetControls: boolean;
            controlsPosition: "outside" | "start" | "end";
            transferPosition: "middle" | "end";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        ui?: import("./types").ApexPickListClasses;
        modelValue?: [{
            [x: string]: unknown;
        }[], {
            [x: string]: unknown;
        }[]] | {
            [x: string]: unknown;
        }[][];
        dataKey?: string;
        sourceHeader?: string;
        targetHeader?: string;
        checkbox?: boolean;
        filter?: boolean;
        filterPlaceholder?: string;
        showSourceControls?: boolean;
        showTargetControls?: boolean;
        controlsPosition?: "outside" | "start" | "end";
        transferPosition?: "middle" | "end";
        stacked?: boolean;
        scrollHeight?: number;
        noDrag?: boolean;
        emptyMessage?: string;
        disabled?: boolean;
        borderColor?: string;
        borderWidth?: number;
        radius?: string;
        headerBackground?: string;
        headerColor?: string;
        listBackground?: string;
        itemColor?: string;
        selectedBackground?: string;
        selectedColor?: string;
        selectedBorderColor?: string;
        gap?: string;
    }> & Readonly<{
        "onUpdate:modelValue"?: ((v: {
            [x: string]: unknown;
        }[][]) => any) | undefined;
        onReorder?: ((payload: {
            side: 0 | 1;
            from: number;
            to: number;
        }) => any) | undefined;
        "onMove-to-target"?: ((payload: {
            items: {
                [x: string]: unknown;
            }[];
        }) => any) | undefined;
        "onMove-to-source"?: ((payload: {
            items: {
                [x: string]: unknown;
            }[];
        }) => any) | undefined;
        "onMove-all-to-target"?: ((payload: {
            items: {
                [x: string]: unknown;
            }[];
        }) => any) | undefined;
        "onMove-all-to-source"?: ((payload: {
            items: {
                [x: string]: unknown;
            }[];
        }) => any) | undefined;
        "onSelection-change"?: ((payload: {
            side: 0 | 1;
            items: {
                [x: string]: unknown;
            }[];
        }) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (v: {
            [x: string]: unknown;
        }[][]) => void;
        reorder: (payload: {
            side: 0 | 1;
            from: number;
            to: number;
        }) => void;
        "move-to-target": (payload: {
            items: {
                [x: string]: unknown;
            }[];
        }) => void;
        "move-to-source": (payload: {
            items: {
                [x: string]: unknown;
            }[];
        }) => void;
        "move-all-to-target": (payload: {
            items: {
                [x: string]: unknown;
            }[];
        }) => void;
        "move-all-to-source": (payload: {
            items: {
                [x: string]: unknown;
            }[];
        }) => void;
        "selection-change": (payload: {
            side: 0 | 1;
            items: {
                [x: string]: unknown;
            }[];
        }) => void;
    }, string, {
        scrollHeight: number;
        sourceHeader: string;
        targetHeader: string;
        showSourceControls: boolean;
        showTargetControls: boolean;
        controlsPosition: "outside" | "start" | "end";
        transferPosition: "middle" | "end";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            sourceheader?: ((props: {}) => any) | undefined;
            targetheader?: ((props: {}) => any) | undefined;
        } & {
            option?: (props: {
                item: {
                    [x: string]: unknown;
                };
                index: number;
                side: 0 | 1;
            }) => any;
        };
    });
    Timeline: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            ui?: import("./types").ApexTimelineClasses;
            value?: {
                [x: string]: unknown;
            }[];
            align?: "start" | "end" | "alternate";
            layout?: "vertical" | "horizontal";
            dataKey?: string;
            lineColor?: string;
            lineWidth?: number;
            lineStyle?: "solid" | "dashed" | "dotted";
            markerSize?: number;
            markerColor?: string;
            markerBorderColor?: string;
            markerBorderWidth?: number;
            markerRadius?: string;
            iconField?: string;
            colorField?: string;
            gap?: string;
            eventGap?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            align: "start" | "end" | "alternate";
            layout: "vertical" | "horizontal";
            lineWidth: number;
            lineStyle: "solid" | "dashed" | "dotted";
            markerSize: number;
            markerBorderWidth: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            ui?: import("./types").ApexTimelineClasses;
            value?: {
                [x: string]: unknown;
            }[];
            align?: "start" | "end" | "alternate";
            layout?: "vertical" | "horizontal";
            dataKey?: string;
            lineColor?: string;
            lineWidth?: number;
            lineStyle?: "solid" | "dashed" | "dotted";
            markerSize?: number;
            markerColor?: string;
            markerBorderColor?: string;
            markerBorderWidth?: number;
            markerRadius?: string;
            iconField?: string;
            colorField?: string;
            gap?: string;
            eventGap?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            align: "start" | "end" | "alternate";
            layout: "vertical" | "horizontal";
            lineWidth: number;
            lineStyle: "solid" | "dashed" | "dotted";
            markerSize: number;
            markerBorderWidth: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        ui?: import("./types").ApexTimelineClasses;
        value?: {
            [x: string]: unknown;
        }[];
        align?: "start" | "end" | "alternate";
        layout?: "vertical" | "horizontal";
        dataKey?: string;
        lineColor?: string;
        lineWidth?: number;
        lineStyle?: "solid" | "dashed" | "dotted";
        markerSize?: number;
        markerColor?: string;
        markerBorderColor?: string;
        markerBorderWidth?: number;
        markerRadius?: string;
        iconField?: string;
        colorField?: string;
        gap?: string;
        eventGap?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        align: "start" | "end" | "alternate";
        layout: "vertical" | "horizontal";
        lineWidth: number;
        lineStyle: "solid" | "dashed" | "dotted";
        markerSize: number;
        markerBorderWidth: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            opposite?: (props: {
                item: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any;
        } & {
            marker?: (props: {
                item: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any;
        } & {
            connector?: (props: {
                item: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any;
        } & {
            content?: (props: {
                item: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any;
        } & {
            default?: (props: {
                item: {
                    [x: string]: unknown;
                };
                index: number;
            }) => any;
        };
    });
    Tree: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            ui?: import("./types").ApexTreeClasses;
            value?: import(".").ApexTreeNode[];
            expandedKeys?: Record<string, boolean>;
            selectionMode?: "single" | "multiple" | "checkbox" | null;
            selectionKeys?: Record<string, boolean | import(".").CheckState>;
            metaKeySelection?: boolean;
            showSelectAll?: boolean;
            filter?: boolean;
            filterBy?: string;
            filterMode?: "lenient" | "strict";
            filterPlaceholder?: string;
            lazy?: boolean;
            loading?: boolean;
            loadingMode?: "overlay" | "skeleton";
            skeletonRows?: number;
            draggableNodes?: boolean;
            droppableNodes?: boolean;
            draggableScope?: string;
            droppableScope?: string;
            scrollHeight?: number;
            indent?: number;
            bordered?: boolean;
            emptyMessage?: string;
            hoverBackground?: string;
            selectedBackground?: string;
            selectedColor?: string;
            iconColor?: string;
            rowRadius?: string;
        }> & Readonly<{
            onFilter?: ((payload: {
                value: string;
            }) => any) | undefined;
            "onNode-expand"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onNode-collapse"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onUpdate:selectionKeys"?: ((v: Record<string, boolean | import(".").CheckState>) => any) | undefined;
            "onNode-select"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onNode-unselect"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onUpdate:value"?: ((v: import(".").ApexTreeNode[]) => any) | undefined;
            "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
            "onNode-drop"?: ((payload: {
                dragNode: import(".").ApexTreeNode;
                dropNode?: import(".").ApexTreeNode;
                position: string;
                value: import(".").ApexTreeNode[];
            }) => any) | undefined;
        }>, {
            focusRow: (i: number) => void;
            toggle: (node: import(".").ApexTreeNode) => void;
            select: (node: import(".").ApexTreeNode, e?: MouseEvent | KeyboardEvent) => void;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:value": (v: import(".").ApexTreeNode[]) => void;
            "update:expandedKeys": (v: Record<string, boolean>) => void;
            "update:selectionKeys": (v: Record<string, boolean | import(".").CheckState>) => void;
            "node-expand": (node: import(".").ApexTreeNode) => void;
            "node-collapse": (node: import(".").ApexTreeNode) => void;
            "node-select": (node: import(".").ApexTreeNode) => void;
            "node-unselect": (node: import(".").ApexTreeNode) => void;
            "node-drop": (payload: {
                dragNode: import(".").ApexTreeNode;
                dropNode?: import(".").ApexTreeNode;
                position: string;
                value: import(".").ApexTreeNode[];
            }) => void;
            filter: (payload: {
                value: string;
            }) => void;
        }, import("vue").PublicProps, {
            selectionMode: "single" | "multiple" | "checkbox" | null;
            indent: number;
            bordered: boolean;
            loadingMode: "overlay" | "skeleton";
            skeletonRows: number;
            filterBy: string;
            filterMode: "lenient" | "strict";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            ui?: import("./types").ApexTreeClasses;
            value?: import(".").ApexTreeNode[];
            expandedKeys?: Record<string, boolean>;
            selectionMode?: "single" | "multiple" | "checkbox" | null;
            selectionKeys?: Record<string, boolean | import(".").CheckState>;
            metaKeySelection?: boolean;
            showSelectAll?: boolean;
            filter?: boolean;
            filterBy?: string;
            filterMode?: "lenient" | "strict";
            filterPlaceholder?: string;
            lazy?: boolean;
            loading?: boolean;
            loadingMode?: "overlay" | "skeleton";
            skeletonRows?: number;
            draggableNodes?: boolean;
            droppableNodes?: boolean;
            draggableScope?: string;
            droppableScope?: string;
            scrollHeight?: number;
            indent?: number;
            bordered?: boolean;
            emptyMessage?: string;
            hoverBackground?: string;
            selectedBackground?: string;
            selectedColor?: string;
            iconColor?: string;
            rowRadius?: string;
        }> & Readonly<{
            onFilter?: ((payload: {
                value: string;
            }) => any) | undefined;
            "onNode-expand"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onNode-collapse"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onUpdate:selectionKeys"?: ((v: Record<string, boolean | import(".").CheckState>) => any) | undefined;
            "onNode-select"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onNode-unselect"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onUpdate:value"?: ((v: import(".").ApexTreeNode[]) => any) | undefined;
            "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
            "onNode-drop"?: ((payload: {
                dragNode: import(".").ApexTreeNode;
                dropNode?: import(".").ApexTreeNode;
                position: string;
                value: import(".").ApexTreeNode[];
            }) => any) | undefined;
        }>, {
            focusRow: (i: number) => void;
            toggle: (node: import(".").ApexTreeNode) => void;
            select: (node: import(".").ApexTreeNode, e?: MouseEvent | KeyboardEvent) => void;
        }, {}, {}, {}, {
            selectionMode: "single" | "multiple" | "checkbox" | null;
            indent: number;
            bordered: boolean;
            loadingMode: "overlay" | "skeleton";
            skeletonRows: number;
            filterBy: string;
            filterMode: "lenient" | "strict";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        ui?: import("./types").ApexTreeClasses;
        value?: import(".").ApexTreeNode[];
        expandedKeys?: Record<string, boolean>;
        selectionMode?: "single" | "multiple" | "checkbox" | null;
        selectionKeys?: Record<string, boolean | import(".").CheckState>;
        metaKeySelection?: boolean;
        showSelectAll?: boolean;
        filter?: boolean;
        filterBy?: string;
        filterMode?: "lenient" | "strict";
        filterPlaceholder?: string;
        lazy?: boolean;
        loading?: boolean;
        loadingMode?: "overlay" | "skeleton";
        skeletonRows?: number;
        draggableNodes?: boolean;
        droppableNodes?: boolean;
        draggableScope?: string;
        droppableScope?: string;
        scrollHeight?: number;
        indent?: number;
        bordered?: boolean;
        emptyMessage?: string;
        hoverBackground?: string;
        selectedBackground?: string;
        selectedColor?: string;
        iconColor?: string;
        rowRadius?: string;
    }> & Readonly<{
        onFilter?: ((payload: {
            value: string;
        }) => any) | undefined;
        "onNode-expand"?: ((node: import(".").ApexTreeNode) => any) | undefined;
        "onNode-collapse"?: ((node: import(".").ApexTreeNode) => any) | undefined;
        "onUpdate:selectionKeys"?: ((v: Record<string, boolean | import(".").CheckState>) => any) | undefined;
        "onNode-select"?: ((node: import(".").ApexTreeNode) => any) | undefined;
        "onNode-unselect"?: ((node: import(".").ApexTreeNode) => any) | undefined;
        "onUpdate:value"?: ((v: import(".").ApexTreeNode[]) => any) | undefined;
        "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
        "onNode-drop"?: ((payload: {
            dragNode: import(".").ApexTreeNode;
            dropNode?: import(".").ApexTreeNode;
            position: string;
            value: import(".").ApexTreeNode[];
        }) => any) | undefined;
    }>, {
        focusRow: (i: number) => void;
        toggle: (node: import(".").ApexTreeNode) => void;
        select: (node: import(".").ApexTreeNode, e?: MouseEvent | KeyboardEvent) => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:value": (v: import(".").ApexTreeNode[]) => void;
        "update:expandedKeys": (v: Record<string, boolean>) => void;
        "update:selectionKeys": (v: Record<string, boolean | import(".").CheckState>) => void;
        "node-expand": (node: import(".").ApexTreeNode) => void;
        "node-collapse": (node: import(".").ApexTreeNode) => void;
        "node-select": (node: import(".").ApexTreeNode) => void;
        "node-unselect": (node: import(".").ApexTreeNode) => void;
        "node-drop": (payload: {
            dragNode: import(".").ApexTreeNode;
            dropNode?: import(".").ApexTreeNode;
            position: string;
            value: import(".").ApexTreeNode[];
        }) => void;
        filter: (payload: {
            value: string;
        }) => void;
    }, string, {
        selectionMode: "single" | "multiple" | "checkbox" | null;
        indent: number;
        bordered: boolean;
        loadingMode: "overlay" | "skeleton";
        skeletonRows: number;
        filterBy: string;
        filterMode: "lenient" | "strict";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            header?: (props: {}) => any;
        } & {
            nodetoggleicon?: (props: {
                node: import(".").ApexTreeNode;
                expanded: boolean;
            }) => any;
        } & {
            nodeicon?: (props: {
                node: import(".").ApexTreeNode;
                expanded: boolean;
                hasChildren: boolean;
            }) => any;
        } & {
            node?: (props: {
                node: import(".").ApexTreeNode;
                expanded: boolean;
                index: number;
            }) => any;
        } & {
            default?: (props: {
                node: import(".").ApexTreeNode;
                index: number;
            }) => any;
        } & {
            empty?: (props: {}) => any;
        } & {
            loading?: (props: {}) => any;
        } & {
            footer?: (props: {}) => any;
        };
    });
    TreeTable: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            ui?: import("./types").ApexTreeTableClasses;
            value?: import(".").ApexTreeNode[];
            columns?: import(".").TreeColumn[];
            expandedKeys?: Record<string, boolean>;
            size?: "small" | "normal" | "large";
            gridLines?: "none" | "both" | "horizontal" | "vertical";
            striped?: boolean;
            bordered?: boolean;
            indent?: number;
            caption?: string;
            selectionMode?: "single" | "multiple" | "checkbox" | null;
            selectionKeys?: Record<string, boolean | import(".").CheckState>;
            metaKeySelection?: boolean;
            sortMode?: "single" | "multiple";
            sortField?: string;
            sortOrder?: import(".").SortOrder;
            multiSortMeta?: import(".").SortMeta[];
            removableSort?: boolean;
            filters?: Record<string, {
                value?: unknown;
                matchMode?: string;
            }>;
            filterDisplay?: "row" | null;
            filterMode?: "lenient" | "strict";
            showGlobalFilter?: boolean;
            paginator?: boolean;
            rows?: number;
            first?: number;
            rowsPerPageOptions?: number[];
            lazy?: boolean;
            totalRecords?: number;
            scrollable?: boolean;
            scrollHeight?: string;
            tableMinWidth?: string;
            loading?: boolean;
            loadingMode?: "overlay" | "skeleton";
            skeletonRows?: number;
            emptyMessage?: string;
            showFooter?: boolean;
        }> & Readonly<{
            onSort?: ((payload: {
                sortField?: string;
                sortOrder: import(".").SortOrder;
                multiSortMeta: import(".").SortMeta[];
            }) => any) | undefined;
            onFilter?: ((payload: {
                filters: Record<string, {
                    value?: unknown;
                    matchMode?: string;
                }>;
            }) => any) | undefined;
            "onNode-expand"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onNode-collapse"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onUpdate:first"?: ((v: number) => any) | undefined;
            "onUpdate:rows"?: ((v: number) => any) | undefined;
            onPage?: ((payload: {
                first: number;
                rows: number;
                page: number;
            }) => any) | undefined;
            "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
            "onUpdate:sortOrder"?: ((v: import(".").SortOrder) => any) | undefined;
            "onUpdate:multiSortMeta"?: ((v: import(".").SortMeta[]) => any) | undefined;
            "onUpdate:filters"?: ((v: Record<string, {
                value?: unknown;
                matchMode?: string;
            }>) => any) | undefined;
            "onUpdate:selectionKeys"?: ((v: Record<string, boolean | import(".").CheckState>) => any) | undefined;
            "onNode-select"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onNode-unselect"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
        }>, {
            focusRow: (i: number) => void;
            toggle: (node: import(".").ApexTreeNode) => void;
            select: (node: import(".").ApexTreeNode, e?: MouseEvent | KeyboardEvent) => void;
            selectAllVisible: () => void;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:expandedKeys": (v: Record<string, boolean>) => void;
            "update:selectionKeys": (v: Record<string, boolean | import(".").CheckState>) => void;
            "update:filters": (v: Record<string, {
                value?: unknown;
                matchMode?: string;
            }>) => void;
            "update:first": (v: number) => void;
            "update:rows": (v: number) => void;
            "update:sortField": (v: string | undefined) => void;
            "update:sortOrder": (v: import(".").SortOrder) => void;
            "update:multiSortMeta": (v: import(".").SortMeta[]) => void;
            "node-expand": (node: import(".").ApexTreeNode) => void;
            "node-collapse": (node: import(".").ApexTreeNode) => void;
            "node-select": (node: import(".").ApexTreeNode) => void;
            "node-unselect": (node: import(".").ApexTreeNode) => void;
            sort: (payload: {
                sortField?: string;
                sortOrder: import(".").SortOrder;
                multiSortMeta: import(".").SortMeta[];
            }) => void;
            page: (payload: {
                first: number;
                rows: number;
                page: number;
            }) => void;
            filter: (payload: {
                filters: Record<string, {
                    value?: unknown;
                    matchMode?: string;
                }>;
            }) => void;
        }, import("vue").PublicProps, {
            size: "small" | "normal" | "large";
            rows: number;
            selectionMode: "single" | "multiple" | "checkbox" | null;
            indent: number;
            first: number;
            gridLines: "none" | "both" | "horizontal" | "vertical";
            bordered: boolean;
            sortMode: "single" | "multiple";
            removableSort: boolean;
            loadingMode: "overlay" | "skeleton";
            skeletonRows: number;
            filterMode: "lenient" | "strict";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            ui?: import("./types").ApexTreeTableClasses;
            value?: import(".").ApexTreeNode[];
            columns?: import(".").TreeColumn[];
            expandedKeys?: Record<string, boolean>;
            size?: "small" | "normal" | "large";
            gridLines?: "none" | "both" | "horizontal" | "vertical";
            striped?: boolean;
            bordered?: boolean;
            indent?: number;
            caption?: string;
            selectionMode?: "single" | "multiple" | "checkbox" | null;
            selectionKeys?: Record<string, boolean | import(".").CheckState>;
            metaKeySelection?: boolean;
            sortMode?: "single" | "multiple";
            sortField?: string;
            sortOrder?: import(".").SortOrder;
            multiSortMeta?: import(".").SortMeta[];
            removableSort?: boolean;
            filters?: Record<string, {
                value?: unknown;
                matchMode?: string;
            }>;
            filterDisplay?: "row" | null;
            filterMode?: "lenient" | "strict";
            showGlobalFilter?: boolean;
            paginator?: boolean;
            rows?: number;
            first?: number;
            rowsPerPageOptions?: number[];
            lazy?: boolean;
            totalRecords?: number;
            scrollable?: boolean;
            scrollHeight?: string;
            tableMinWidth?: string;
            loading?: boolean;
            loadingMode?: "overlay" | "skeleton";
            skeletonRows?: number;
            emptyMessage?: string;
            showFooter?: boolean;
        }> & Readonly<{
            onSort?: ((payload: {
                sortField?: string;
                sortOrder: import(".").SortOrder;
                multiSortMeta: import(".").SortMeta[];
            }) => any) | undefined;
            onFilter?: ((payload: {
                filters: Record<string, {
                    value?: unknown;
                    matchMode?: string;
                }>;
            }) => any) | undefined;
            "onNode-expand"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onNode-collapse"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onUpdate:first"?: ((v: number) => any) | undefined;
            "onUpdate:rows"?: ((v: number) => any) | undefined;
            onPage?: ((payload: {
                first: number;
                rows: number;
                page: number;
            }) => any) | undefined;
            "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
            "onUpdate:sortOrder"?: ((v: import(".").SortOrder) => any) | undefined;
            "onUpdate:multiSortMeta"?: ((v: import(".").SortMeta[]) => any) | undefined;
            "onUpdate:filters"?: ((v: Record<string, {
                value?: unknown;
                matchMode?: string;
            }>) => any) | undefined;
            "onUpdate:selectionKeys"?: ((v: Record<string, boolean | import(".").CheckState>) => any) | undefined;
            "onNode-select"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onNode-unselect"?: ((node: import(".").ApexTreeNode) => any) | undefined;
            "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
        }>, {
            focusRow: (i: number) => void;
            toggle: (node: import(".").ApexTreeNode) => void;
            select: (node: import(".").ApexTreeNode, e?: MouseEvent | KeyboardEvent) => void;
            selectAllVisible: () => void;
        }, {}, {}, {}, {
            size: "small" | "normal" | "large";
            rows: number;
            selectionMode: "single" | "multiple" | "checkbox" | null;
            indent: number;
            first: number;
            gridLines: "none" | "both" | "horizontal" | "vertical";
            bordered: boolean;
            sortMode: "single" | "multiple";
            removableSort: boolean;
            loadingMode: "overlay" | "skeleton";
            skeletonRows: number;
            filterMode: "lenient" | "strict";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        ui?: import("./types").ApexTreeTableClasses;
        value?: import(".").ApexTreeNode[];
        columns?: import(".").TreeColumn[];
        expandedKeys?: Record<string, boolean>;
        size?: "small" | "normal" | "large";
        gridLines?: "none" | "both" | "horizontal" | "vertical";
        striped?: boolean;
        bordered?: boolean;
        indent?: number;
        caption?: string;
        selectionMode?: "single" | "multiple" | "checkbox" | null;
        selectionKeys?: Record<string, boolean | import(".").CheckState>;
        metaKeySelection?: boolean;
        sortMode?: "single" | "multiple";
        sortField?: string;
        sortOrder?: import(".").SortOrder;
        multiSortMeta?: import(".").SortMeta[];
        removableSort?: boolean;
        filters?: Record<string, {
            value?: unknown;
            matchMode?: string;
        }>;
        filterDisplay?: "row" | null;
        filterMode?: "lenient" | "strict";
        showGlobalFilter?: boolean;
        paginator?: boolean;
        rows?: number;
        first?: number;
        rowsPerPageOptions?: number[];
        lazy?: boolean;
        totalRecords?: number;
        scrollable?: boolean;
        scrollHeight?: string;
        tableMinWidth?: string;
        loading?: boolean;
        loadingMode?: "overlay" | "skeleton";
        skeletonRows?: number;
        emptyMessage?: string;
        showFooter?: boolean;
    }> & Readonly<{
        onSort?: ((payload: {
            sortField?: string;
            sortOrder: import(".").SortOrder;
            multiSortMeta: import(".").SortMeta[];
        }) => any) | undefined;
        onFilter?: ((payload: {
            filters: Record<string, {
                value?: unknown;
                matchMode?: string;
            }>;
        }) => any) | undefined;
        "onNode-expand"?: ((node: import(".").ApexTreeNode) => any) | undefined;
        "onNode-collapse"?: ((node: import(".").ApexTreeNode) => any) | undefined;
        "onUpdate:first"?: ((v: number) => any) | undefined;
        "onUpdate:rows"?: ((v: number) => any) | undefined;
        onPage?: ((payload: {
            first: number;
            rows: number;
            page: number;
        }) => any) | undefined;
        "onUpdate:sortField"?: ((v: string | undefined) => any) | undefined;
        "onUpdate:sortOrder"?: ((v: import(".").SortOrder) => any) | undefined;
        "onUpdate:multiSortMeta"?: ((v: import(".").SortMeta[]) => any) | undefined;
        "onUpdate:filters"?: ((v: Record<string, {
            value?: unknown;
            matchMode?: string;
        }>) => any) | undefined;
        "onUpdate:selectionKeys"?: ((v: Record<string, boolean | import(".").CheckState>) => any) | undefined;
        "onNode-select"?: ((node: import(".").ApexTreeNode) => any) | undefined;
        "onNode-unselect"?: ((node: import(".").ApexTreeNode) => any) | undefined;
        "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
    }>, {
        focusRow: (i: number) => void;
        toggle: (node: import(".").ApexTreeNode) => void;
        select: (node: import(".").ApexTreeNode, e?: MouseEvent | KeyboardEvent) => void;
        selectAllVisible: () => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:expandedKeys": (v: Record<string, boolean>) => void;
        "update:selectionKeys": (v: Record<string, boolean | import(".").CheckState>) => void;
        "update:filters": (v: Record<string, {
            value?: unknown;
            matchMode?: string;
        }>) => void;
        "update:first": (v: number) => void;
        "update:rows": (v: number) => void;
        "update:sortField": (v: string | undefined) => void;
        "update:sortOrder": (v: import(".").SortOrder) => void;
        "update:multiSortMeta": (v: import(".").SortMeta[]) => void;
        "node-expand": (node: import(".").ApexTreeNode) => void;
        "node-collapse": (node: import(".").ApexTreeNode) => void;
        "node-select": (node: import(".").ApexTreeNode) => void;
        "node-unselect": (node: import(".").ApexTreeNode) => void;
        sort: (payload: {
            sortField?: string;
            sortOrder: import(".").SortOrder;
            multiSortMeta: import(".").SortMeta[];
        }) => void;
        page: (payload: {
            first: number;
            rows: number;
            page: number;
        }) => void;
        filter: (payload: {
            filters: Record<string, {
                value?: unknown;
                matchMode?: string;
            }>;
        }) => void;
    }, string, {
        size: "small" | "normal" | "large";
        rows: number;
        selectionMode: "single" | "multiple" | "checkbox" | null;
        indent: number;
        first: number;
        gridLines: "none" | "both" | "horizontal" | "vertical";
        bordered: boolean;
        sortMode: "single" | "multiple";
        removableSort: boolean;
        loadingMode: "overlay" | "skeleton";
        skeletonRows: number;
        filterMode: "lenient" | "strict";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            [x: `header:${string}`]: ((props: {
                column: import(".").TreeColumn;
            }) => any) | undefined;
        } & {
            [x: `header:${string}`]: ((props: {
                column: import(".").TreeColumn;
            }) => any) | undefined;
        } & {
            [x: `filter:${string}`]: ((props: {
                column: import(".").TreeColumn;
            }) => any) | undefined;
        } & {
            [x: `cell:${string}`]: ((props: {
                node: import(".").ApexTreeNode;
                column: import(".").TreeColumn;
                value: unknown;
                index: number;
            }) => any) | undefined;
        } & {
            [x: `cell:${string}`]: ((props: {
                node: import(".").ApexTreeNode;
                column: import(".").TreeColumn;
                value: unknown;
                index: number;
            }) => any) | undefined;
        } & {
            header?: (props: {}) => any;
        } & {
            empty?: (props: {}) => any;
        } & {
            loading?: (props: {}) => any;
        } & {
            footer?: (props: {}) => any;
        };
    });
    Scheduler: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            ui?: import("./types").ApexSchedulerClasses;
            resources?: import(".").SchedulerResource[];
            events?: import(".").SchedulerEvent[];
            mode?: import(".").SchedulerMode;
            anchor?: Date;
            groupKeys?: string[];
            groupFields?: import("./components/ApexScheduler.vue").SchedulerGroupField[];
            types?: Record<string, import(".").SchedulerTypeMeta>;
            leafLabel?: string;
            leafIcon?: string;
            resourceName?: (r: import(".").SchedulerResource) => string;
            resourceSub?: (r: import(".").SchedulerResource) => string;
            height?: string;
            resourceWidth?: string;
            draggable?: boolean;
            resizable?: boolean;
            newId?: (inst: import(".").SchedulerInstance) => string;
            creatable?: boolean;
            inlineEditor?: boolean;
            showToolbar?: boolean;
            showGrouping?: boolean;
            showLegend?: boolean;
            chipsPerCell?: number;
            scrollToHour?: number;
        }> & Readonly<{
            "onUpdate:mode"?: ((v: import(".").SchedulerMode) => any) | undefined;
            "onUpdate:anchor"?: ((v: Date) => any) | undefined;
            "onUpdate:groupKeys"?: ((v: string[]) => any) | undefined;
            "onEvent-move"?: ((payload: import("./components/ApexScheduler.vue").SchedulerMovePayload) => any) | undefined;
            "onEvent-resize"?: ((payload: import("./components/ApexScheduler.vue").SchedulerMovePayload) => any) | undefined;
            "onEvent-click"?: ((payload: {
                instance: import(".").SchedulerInstance;
                originalEvent: PointerEvent | MouseEvent;
            }) => any) | undefined;
            "onEvent-save"?: ((payload: import("./components/ApexScheduler.vue").SchedulerSavePayload) => any) | undefined;
            "onEvent-delete"?: ((payload: {
                id: string;
            }) => any) | undefined;
            "onCreate-request"?: ((payload: {
                resourceId: string;
                start: number;
                type: string;
            }) => any) | undefined;
            "onRange-change"?: ((payload: {
                from: number;
                to: number;
                mode: import(".").SchedulerMode;
            }) => any) | undefined;
        }>, {
            openCreate: (resourceId: string, start: number, type?: string) => void;
            expandAll: () => void;
            collapseAll: () => void;
            goToday: () => void;
            step: (dir: number) => void;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "update:mode": (v: import(".").SchedulerMode) => any;
            "update:anchor": (v: Date) => any;
            "update:groupKeys": (v: string[]) => any;
            "event-move": (payload: import("./components/ApexScheduler.vue").SchedulerMovePayload) => any;
            "event-resize": (payload: import("./components/ApexScheduler.vue").SchedulerMovePayload) => any;
            "event-click": (payload: {
                instance: import(".").SchedulerInstance;
                originalEvent: PointerEvent | MouseEvent;
            }) => any;
            "event-save": (payload: import("./components/ApexScheduler.vue").SchedulerSavePayload) => any;
            "event-delete": (payload: {
                id: string;
            }) => any;
            "create-request": (payload: {
                resourceId: string;
                start: number;
                type: string;
            }) => any;
            "range-change": (payload: {
                from: number;
                to: number;
                mode: import(".").SchedulerMode;
            }) => any;
        }, import("vue").PublicProps, {
            anchor: Date;
            draggable: boolean;
            height: string;
            mode: import(".").SchedulerMode;
            resizable: boolean;
            events: import(".").SchedulerEvent[];
            resources: import(".").SchedulerResource[];
            groupKeys: string[];
            groupFields: import("./components/ApexScheduler.vue").SchedulerGroupField[];
            types: Record<string, import(".").SchedulerTypeMeta>;
            leafLabel: string;
            leafIcon: string;
            resourceWidth: string;
            creatable: boolean;
            inlineEditor: boolean;
            showToolbar: boolean;
            showGrouping: boolean;
            showLegend: boolean;
            chipsPerCell: number;
            scrollToHour: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            ui?: import("./types").ApexSchedulerClasses;
            resources?: import(".").SchedulerResource[];
            events?: import(".").SchedulerEvent[];
            mode?: import(".").SchedulerMode;
            anchor?: Date;
            groupKeys?: string[];
            groupFields?: import("./components/ApexScheduler.vue").SchedulerGroupField[];
            types?: Record<string, import(".").SchedulerTypeMeta>;
            leafLabel?: string;
            leafIcon?: string;
            resourceName?: (r: import(".").SchedulerResource) => string;
            resourceSub?: (r: import(".").SchedulerResource) => string;
            height?: string;
            resourceWidth?: string;
            draggable?: boolean;
            resizable?: boolean;
            newId?: (inst: import(".").SchedulerInstance) => string;
            creatable?: boolean;
            inlineEditor?: boolean;
            showToolbar?: boolean;
            showGrouping?: boolean;
            showLegend?: boolean;
            chipsPerCell?: number;
            scrollToHour?: number;
        }> & Readonly<{
            "onUpdate:mode"?: ((v: import(".").SchedulerMode) => any) | undefined;
            "onUpdate:anchor"?: ((v: Date) => any) | undefined;
            "onUpdate:groupKeys"?: ((v: string[]) => any) | undefined;
            "onEvent-move"?: ((payload: import("./components/ApexScheduler.vue").SchedulerMovePayload) => any) | undefined;
            "onEvent-resize"?: ((payload: import("./components/ApexScheduler.vue").SchedulerMovePayload) => any) | undefined;
            "onEvent-click"?: ((payload: {
                instance: import(".").SchedulerInstance;
                originalEvent: PointerEvent | MouseEvent;
            }) => any) | undefined;
            "onEvent-save"?: ((payload: import("./components/ApexScheduler.vue").SchedulerSavePayload) => any) | undefined;
            "onEvent-delete"?: ((payload: {
                id: string;
            }) => any) | undefined;
            "onCreate-request"?: ((payload: {
                resourceId: string;
                start: number;
                type: string;
            }) => any) | undefined;
            "onRange-change"?: ((payload: {
                from: number;
                to: number;
                mode: import(".").SchedulerMode;
            }) => any) | undefined;
        }>, {
            openCreate: (resourceId: string, start: number, type?: string) => void;
            expandAll: () => void;
            collapseAll: () => void;
            goToday: () => void;
            step: (dir: number) => void;
        }, {}, {}, {}, {
            anchor: Date;
            draggable: boolean;
            height: string;
            mode: import(".").SchedulerMode;
            resizable: boolean;
            events: import(".").SchedulerEvent[];
            resources: import(".").SchedulerResource[];
            groupKeys: string[];
            groupFields: import("./components/ApexScheduler.vue").SchedulerGroupField[];
            types: Record<string, import(".").SchedulerTypeMeta>;
            leafLabel: string;
            leafIcon: string;
            resourceWidth: string;
            creatable: boolean;
            inlineEditor: boolean;
            showToolbar: boolean;
            showGrouping: boolean;
            showLegend: boolean;
            chipsPerCell: number;
            scrollToHour: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        ui?: import("./types").ApexSchedulerClasses;
        resources?: import(".").SchedulerResource[];
        events?: import(".").SchedulerEvent[];
        mode?: import(".").SchedulerMode;
        anchor?: Date;
        groupKeys?: string[];
        groupFields?: import("./components/ApexScheduler.vue").SchedulerGroupField[];
        types?: Record<string, import(".").SchedulerTypeMeta>;
        leafLabel?: string;
        leafIcon?: string;
        resourceName?: (r: import(".").SchedulerResource) => string;
        resourceSub?: (r: import(".").SchedulerResource) => string;
        height?: string;
        resourceWidth?: string;
        draggable?: boolean;
        resizable?: boolean;
        newId?: (inst: import(".").SchedulerInstance) => string;
        creatable?: boolean;
        inlineEditor?: boolean;
        showToolbar?: boolean;
        showGrouping?: boolean;
        showLegend?: boolean;
        chipsPerCell?: number;
        scrollToHour?: number;
    }> & Readonly<{
        "onUpdate:mode"?: ((v: import(".").SchedulerMode) => any) | undefined;
        "onUpdate:anchor"?: ((v: Date) => any) | undefined;
        "onUpdate:groupKeys"?: ((v: string[]) => any) | undefined;
        "onEvent-move"?: ((payload: import("./components/ApexScheduler.vue").SchedulerMovePayload) => any) | undefined;
        "onEvent-resize"?: ((payload: import("./components/ApexScheduler.vue").SchedulerMovePayload) => any) | undefined;
        "onEvent-click"?: ((payload: {
            instance: import(".").SchedulerInstance;
            originalEvent: PointerEvent | MouseEvent;
        }) => any) | undefined;
        "onEvent-save"?: ((payload: import("./components/ApexScheduler.vue").SchedulerSavePayload) => any) | undefined;
        "onEvent-delete"?: ((payload: {
            id: string;
        }) => any) | undefined;
        "onCreate-request"?: ((payload: {
            resourceId: string;
            start: number;
            type: string;
        }) => any) | undefined;
        "onRange-change"?: ((payload: {
            from: number;
            to: number;
            mode: import(".").SchedulerMode;
        }) => any) | undefined;
    }>, {
        openCreate: (resourceId: string, start: number, type?: string) => void;
        expandAll: () => void;
        collapseAll: () => void;
        goToday: () => void;
        step: (dir: number) => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "update:mode": (v: import(".").SchedulerMode) => any;
        "update:anchor": (v: Date) => any;
        "update:groupKeys": (v: string[]) => any;
        "event-move": (payload: import("./components/ApexScheduler.vue").SchedulerMovePayload) => any;
        "event-resize": (payload: import("./components/ApexScheduler.vue").SchedulerMovePayload) => any;
        "event-click": (payload: {
            instance: import(".").SchedulerInstance;
            originalEvent: PointerEvent | MouseEvent;
        }) => any;
        "event-save": (payload: import("./components/ApexScheduler.vue").SchedulerSavePayload) => any;
        "event-delete": (payload: {
            id: string;
        }) => any;
        "create-request": (payload: {
            resourceId: string;
            start: number;
            type: string;
        }) => any;
        "range-change": (payload: {
            from: number;
            to: number;
            mode: import(".").SchedulerMode;
        }) => any;
    }, string, {
        anchor: Date;
        draggable: boolean;
        height: string;
        mode: import(".").SchedulerMode;
        resizable: boolean;
        events: import(".").SchedulerEvent[];
        resources: import(".").SchedulerResource[];
        groupKeys: string[];
        groupFields: import("./components/ApexScheduler.vue").SchedulerGroupField[];
        types: Record<string, import(".").SchedulerTypeMeta>;
        leafLabel: string;
        leafIcon: string;
        resourceWidth: string;
        creatable: boolean;
        inlineEditor: boolean;
        showToolbar: boolean;
        showGrouping: boolean;
        showLegend: boolean;
        chipsPerCell: number;
        scrollToHour: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            'column-header'?: (props: {
                column: import(".").AxisTier;
                label: string;
                sub: string | undefined;
                today: boolean;
            }) => any;
        } & {
            resource?: (props: {
                resource: import(".").SchedulerResource | undefined;
                row: import("./components/ApexScheduler.vue").RowModel;
                name: string;
                sub: string | undefined;
                group: boolean;
                open: boolean | undefined;
            }) => any;
        } & {
            event?: (props: {
                event: import(".").SchedulerInstance;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import(".").SchedulerMode;
                time: string;
            }) => any;
        } & {
            chip?: (props: {
                icon: string;
                event: import(".").SchedulerInstance;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import(".").SchedulerMode;
                time: string;
            }) => any;
        } & {
            'scope-prompt'?: (props: {
                event: {
                    recurring: boolean;
                    instanceId: string;
                    originalStart: number;
                    overridden: boolean;
                    id: string;
                    roomId: string;
                    type: string;
                    title: string;
                    start: number;
                    end: number;
                    rrule?: string | null | undefined;
                    exdates?: number[] | undefined;
                    overrides?: Record<string, import(".").RecurrenceOverride> | undefined;
                };
                title: string;
                choose: (scope: import(".").RecurrenceScope) => void;
                cancel: () => void;
                options: {
                    scope: import(".").RecurrenceScope;
                    label: string;
                }[];
            }) => any;
        } & {
            popover?: (props: {
                resource: string;
                close: () => void;
                edit: () => void | null;
                remove: () => void | null;
                event: import(".").SchedulerInstance;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import(".").SchedulerMode;
                time: string;
            }) => any;
        };
    });
    Calendar: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            ui?: import("./types").ApexCalendarClasses;
            view?: import("./components/ApexCalendar.vue").CalendarView;
            views?: import("./components/ApexCalendar.vue").CalendarView[];
            events?: import(".").CalendarEvent[];
            resources?: import("./components/ApexCalendar.vue").CalendarResource[];
            backgroundEvents?: import(".").CalendarEvent[];
            anchor?: Date | number;
            timeZone?: string;
            locale?: string | Partial<import(".").ApexLocalePack>;
            firstDay?: number;
            types?: Record<string, import("./components/ApexCalendar.vue").CalendarTypeMeta>;
            eventVariant?: "solid" | "soft" | "outline";
            maxEventsPerDay?: number;
            fixedWeeks?: boolean;
            showWeekNumbers?: boolean;
            showZoneLabel?: boolean;
            showToolbar?: boolean;
            slotDuration?: number;
            slotMinTime?: number;
            slotMaxTime?: number;
            slotHeight?: number;
            scrollToTime?: number;
            maxAllDay?: number;
            listDays?: number;
            yearLayout?: import("./components/ApexCalendar.vue").YearLayout;
            editable?: boolean;
            inlineEditor?: boolean;
            durations?: number[];
            resizable?: boolean;
            newId?: (event: import(".").ResolvedEvent) => string;
            height?: string;
            rowHeight?: string;
            constraints?: import(".").CalendarConstraint[];
            validate?: (cand: import(".").ConstraintCandidate) => boolean | string | null | void;
        }> & Readonly<{
            "onUpdate:anchor"?: ((v: Date) => any) | undefined;
            "onEvent-move"?: ((payload: import("./components/ApexCalendar.vue").EditPayload) => any) | undefined;
            "onEvent-resize"?: ((payload: import("./components/ApexCalendar.vue").EditPayload) => any) | undefined;
            "onEvent-click"?: ((payload: {
                event: import(".").ResolvedEvent;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onEvent-save"?: ((payload: import("./components/ApexCalendar.vue").SavePayload) => any) | undefined;
            "onEvent-delete"?: ((payload: import("./components/ApexCalendar.vue").DeletePayload) => any) | undefined;
            "onRange-change"?: ((payload: {
                from: number;
                to: number;
                view: import("./components/ApexCalendar.vue").CalendarView;
            }) => any) | undefined;
            "onUpdate:view"?: ((v: import("./components/ApexCalendar.vue").CalendarView) => any) | undefined;
            "onSlot-click"?: ((payload: {
                start: number;
                end: number;
                date: Date;
                resourceId?: string;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onDate-click"?: ((payload: {
                date: Date;
                key: string;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onMore-click"?: ((payload: {
                key: string;
                events: import(".").ResolvedEvent[];
            }) => any) | undefined;
            "onEdit-refused"?: ((payload: {
                event?: import(".").ResolvedEvent;
                start: number;
                end: number;
                resourceId?: string;
                reason: string;
                constraint?: import(".").CalendarConstraint;
            }) => any) | undefined;
        }>, {
            step: (dir: number) => void;
            goToday: () => void;
            setView: (v: import("./components/ApexCalendar.vue").CalendarView) => void;
            dayKeyAt: (ms: number) => string;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "update:anchor": (v: Date) => any;
            "event-move": (payload: import("./components/ApexCalendar.vue").EditPayload) => any;
            "event-resize": (payload: import("./components/ApexCalendar.vue").EditPayload) => any;
            "event-click": (payload: {
                event: import(".").ResolvedEvent;
                originalEvent: MouseEvent;
            }) => any;
            "event-save": (payload: import("./components/ApexCalendar.vue").SavePayload) => any;
            "event-delete": (payload: import("./components/ApexCalendar.vue").DeletePayload) => any;
            "range-change": (payload: {
                from: number;
                to: number;
                view: import("./components/ApexCalendar.vue").CalendarView;
            }) => any;
            "update:view": (v: import("./components/ApexCalendar.vue").CalendarView) => any;
            "slot-click": (payload: {
                start: number;
                end: number;
                date: Date;
                resourceId?: string;
                originalEvent: MouseEvent;
            }) => any;
            "date-click": (payload: {
                date: Date;
                key: string;
                originalEvent: MouseEvent;
            }) => any;
            "more-click": (payload: {
                key: string;
                events: import(".").ResolvedEvent[];
            }) => any;
            "edit-refused": (payload: {
                event?: import(".").ResolvedEvent;
                start: number;
                end: number;
                resourceId?: string;
                reason: string;
                constraint?: import(".").CalendarConstraint;
            }) => any;
        }, import("vue").PublicProps, {
            view: import("./components/ApexCalendar.vue").CalendarView;
            constraints: import(".").CalendarConstraint[];
            resizable: boolean;
            editable: boolean;
            events: import(".").CalendarEvent[];
            resources: import("./components/ApexCalendar.vue").CalendarResource[];
            types: Record<string, import("./components/ApexCalendar.vue").CalendarTypeMeta>;
            inlineEditor: boolean;
            showToolbar: boolean;
            fixedWeeks: boolean;
            views: import("./components/ApexCalendar.vue").CalendarView[];
            backgroundEvents: import(".").CalendarEvent[];
            eventVariant: "solid" | "soft" | "outline";
            maxEventsPerDay: number;
            showWeekNumbers: boolean;
            showZoneLabel: boolean;
            slotDuration: number;
            slotMinTime: number;
            slotMaxTime: number;
            slotHeight: number;
            scrollToTime: number;
            maxAllDay: number;
            listDays: number;
            yearLayout: import("./components/ApexCalendar.vue").YearLayout;
            durations: number[];
            rowHeight: string;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            ui?: import("./types").ApexCalendarClasses;
            view?: import("./components/ApexCalendar.vue").CalendarView;
            views?: import("./components/ApexCalendar.vue").CalendarView[];
            events?: import(".").CalendarEvent[];
            resources?: import("./components/ApexCalendar.vue").CalendarResource[];
            backgroundEvents?: import(".").CalendarEvent[];
            anchor?: Date | number;
            timeZone?: string;
            locale?: string | Partial<import(".").ApexLocalePack>;
            firstDay?: number;
            types?: Record<string, import("./components/ApexCalendar.vue").CalendarTypeMeta>;
            eventVariant?: "solid" | "soft" | "outline";
            maxEventsPerDay?: number;
            fixedWeeks?: boolean;
            showWeekNumbers?: boolean;
            showZoneLabel?: boolean;
            showToolbar?: boolean;
            slotDuration?: number;
            slotMinTime?: number;
            slotMaxTime?: number;
            slotHeight?: number;
            scrollToTime?: number;
            maxAllDay?: number;
            listDays?: number;
            yearLayout?: import("./components/ApexCalendar.vue").YearLayout;
            editable?: boolean;
            inlineEditor?: boolean;
            durations?: number[];
            resizable?: boolean;
            newId?: (event: import(".").ResolvedEvent) => string;
            height?: string;
            rowHeight?: string;
            constraints?: import(".").CalendarConstraint[];
            validate?: (cand: import(".").ConstraintCandidate) => boolean | string | null | void;
        }> & Readonly<{
            "onUpdate:anchor"?: ((v: Date) => any) | undefined;
            "onEvent-move"?: ((payload: import("./components/ApexCalendar.vue").EditPayload) => any) | undefined;
            "onEvent-resize"?: ((payload: import("./components/ApexCalendar.vue").EditPayload) => any) | undefined;
            "onEvent-click"?: ((payload: {
                event: import(".").ResolvedEvent;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onEvent-save"?: ((payload: import("./components/ApexCalendar.vue").SavePayload) => any) | undefined;
            "onEvent-delete"?: ((payload: import("./components/ApexCalendar.vue").DeletePayload) => any) | undefined;
            "onRange-change"?: ((payload: {
                from: number;
                to: number;
                view: import("./components/ApexCalendar.vue").CalendarView;
            }) => any) | undefined;
            "onUpdate:view"?: ((v: import("./components/ApexCalendar.vue").CalendarView) => any) | undefined;
            "onSlot-click"?: ((payload: {
                start: number;
                end: number;
                date: Date;
                resourceId?: string;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onDate-click"?: ((payload: {
                date: Date;
                key: string;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onMore-click"?: ((payload: {
                key: string;
                events: import(".").ResolvedEvent[];
            }) => any) | undefined;
            "onEdit-refused"?: ((payload: {
                event?: import(".").ResolvedEvent;
                start: number;
                end: number;
                resourceId?: string;
                reason: string;
                constraint?: import(".").CalendarConstraint;
            }) => any) | undefined;
        }>, {
            step: (dir: number) => void;
            goToday: () => void;
            setView: (v: import("./components/ApexCalendar.vue").CalendarView) => void;
            dayKeyAt: (ms: number) => string;
        }, {}, {}, {}, {
            view: import("./components/ApexCalendar.vue").CalendarView;
            constraints: import(".").CalendarConstraint[];
            resizable: boolean;
            editable: boolean;
            events: import(".").CalendarEvent[];
            resources: import("./components/ApexCalendar.vue").CalendarResource[];
            types: Record<string, import("./components/ApexCalendar.vue").CalendarTypeMeta>;
            inlineEditor: boolean;
            showToolbar: boolean;
            fixedWeeks: boolean;
            views: import("./components/ApexCalendar.vue").CalendarView[];
            backgroundEvents: import(".").CalendarEvent[];
            eventVariant: "solid" | "soft" | "outline";
            maxEventsPerDay: number;
            showWeekNumbers: boolean;
            showZoneLabel: boolean;
            slotDuration: number;
            slotMinTime: number;
            slotMaxTime: number;
            slotHeight: number;
            scrollToTime: number;
            maxAllDay: number;
            listDays: number;
            yearLayout: import("./components/ApexCalendar.vue").YearLayout;
            durations: number[];
            rowHeight: string;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        ui?: import("./types").ApexCalendarClasses;
        view?: import("./components/ApexCalendar.vue").CalendarView;
        views?: import("./components/ApexCalendar.vue").CalendarView[];
        events?: import(".").CalendarEvent[];
        resources?: import("./components/ApexCalendar.vue").CalendarResource[];
        backgroundEvents?: import(".").CalendarEvent[];
        anchor?: Date | number;
        timeZone?: string;
        locale?: string | Partial<import(".").ApexLocalePack>;
        firstDay?: number;
        types?: Record<string, import("./components/ApexCalendar.vue").CalendarTypeMeta>;
        eventVariant?: "solid" | "soft" | "outline";
        maxEventsPerDay?: number;
        fixedWeeks?: boolean;
        showWeekNumbers?: boolean;
        showZoneLabel?: boolean;
        showToolbar?: boolean;
        slotDuration?: number;
        slotMinTime?: number;
        slotMaxTime?: number;
        slotHeight?: number;
        scrollToTime?: number;
        maxAllDay?: number;
        listDays?: number;
        yearLayout?: import("./components/ApexCalendar.vue").YearLayout;
        editable?: boolean;
        inlineEditor?: boolean;
        durations?: number[];
        resizable?: boolean;
        newId?: (event: import(".").ResolvedEvent) => string;
        height?: string;
        rowHeight?: string;
        constraints?: import(".").CalendarConstraint[];
        validate?: (cand: import(".").ConstraintCandidate) => boolean | string | null | void;
    }> & Readonly<{
        "onUpdate:anchor"?: ((v: Date) => any) | undefined;
        "onEvent-move"?: ((payload: import("./components/ApexCalendar.vue").EditPayload) => any) | undefined;
        "onEvent-resize"?: ((payload: import("./components/ApexCalendar.vue").EditPayload) => any) | undefined;
        "onEvent-click"?: ((payload: {
            event: import(".").ResolvedEvent;
            originalEvent: MouseEvent;
        }) => any) | undefined;
        "onEvent-save"?: ((payload: import("./components/ApexCalendar.vue").SavePayload) => any) | undefined;
        "onEvent-delete"?: ((payload: import("./components/ApexCalendar.vue").DeletePayload) => any) | undefined;
        "onRange-change"?: ((payload: {
            from: number;
            to: number;
            view: import("./components/ApexCalendar.vue").CalendarView;
        }) => any) | undefined;
        "onUpdate:view"?: ((v: import("./components/ApexCalendar.vue").CalendarView) => any) | undefined;
        "onSlot-click"?: ((payload: {
            start: number;
            end: number;
            date: Date;
            resourceId?: string;
            originalEvent: MouseEvent;
        }) => any) | undefined;
        "onDate-click"?: ((payload: {
            date: Date;
            key: string;
            originalEvent: MouseEvent;
        }) => any) | undefined;
        "onMore-click"?: ((payload: {
            key: string;
            events: import(".").ResolvedEvent[];
        }) => any) | undefined;
        "onEdit-refused"?: ((payload: {
            event?: import(".").ResolvedEvent;
            start: number;
            end: number;
            resourceId?: string;
            reason: string;
            constraint?: import(".").CalendarConstraint;
        }) => any) | undefined;
    }>, {
        step: (dir: number) => void;
        goToday: () => void;
        setView: (v: import("./components/ApexCalendar.vue").CalendarView) => void;
        dayKeyAt: (ms: number) => string;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "update:anchor": (v: Date) => any;
        "event-move": (payload: import("./components/ApexCalendar.vue").EditPayload) => any;
        "event-resize": (payload: import("./components/ApexCalendar.vue").EditPayload) => any;
        "event-click": (payload: {
            event: import(".").ResolvedEvent;
            originalEvent: MouseEvent;
        }) => any;
        "event-save": (payload: import("./components/ApexCalendar.vue").SavePayload) => any;
        "event-delete": (payload: import("./components/ApexCalendar.vue").DeletePayload) => any;
        "range-change": (payload: {
            from: number;
            to: number;
            view: import("./components/ApexCalendar.vue").CalendarView;
        }) => any;
        "update:view": (v: import("./components/ApexCalendar.vue").CalendarView) => any;
        "slot-click": (payload: {
            start: number;
            end: number;
            date: Date;
            resourceId?: string;
            originalEvent: MouseEvent;
        }) => any;
        "date-click": (payload: {
            date: Date;
            key: string;
            originalEvent: MouseEvent;
        }) => any;
        "more-click": (payload: {
            key: string;
            events: import(".").ResolvedEvent[];
        }) => any;
        "edit-refused": (payload: {
            event?: import(".").ResolvedEvent;
            start: number;
            end: number;
            resourceId?: string;
            reason: string;
            constraint?: import(".").CalendarConstraint;
        }) => any;
    }, string, {
        view: import("./components/ApexCalendar.vue").CalendarView;
        constraints: import(".").CalendarConstraint[];
        resizable: boolean;
        editable: boolean;
        events: import(".").CalendarEvent[];
        resources: import("./components/ApexCalendar.vue").CalendarResource[];
        types: Record<string, import("./components/ApexCalendar.vue").CalendarTypeMeta>;
        inlineEditor: boolean;
        showToolbar: boolean;
        fixedWeeks: boolean;
        views: import("./components/ApexCalendar.vue").CalendarView[];
        backgroundEvents: import(".").CalendarEvent[];
        eventVariant: "solid" | "soft" | "outline";
        maxEventsPerDay: number;
        showWeekNumbers: boolean;
        showZoneLabel: boolean;
        slotDuration: number;
        slotMinTime: number;
        slotMaxTime: number;
        slotHeight: number;
        scrollToTime: number;
        maxAllDay: number;
        listDays: number;
        yearLayout: import("./components/ApexCalendar.vue").YearLayout;
        durations: number[];
        rowHeight: string;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            'toolbar-start'?: (props: {
                view: import("./components/ApexCalendar.vue").CalendarView;
                anchor: Date;
            }) => any;
        } & {
            'toolbar-end'?: (props: {}) => any;
        } & {
            'day-header'?: (props: {
                label: string;
                weekday: number;
                index: number;
                view: "month";
            }) => any;
        } & {
            'day-cell'?: (props: {
                day: import(".").DayCell;
                number: string;
                today: boolean;
                outside: boolean;
                hidden: number;
                events: import(".").ResolvedEvent[];
                view: import("./components/ApexCalendar.vue").CalendarView;
            }) => any;
        } & {
            event?: (props: {
                event: import(".").ResolvedEvent;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import("./components/ApexCalendar.vue").CalendarView;
                time: string;
            }) => any;
        } & {
            event?: (props: {
                event: import(".").ResolvedEvent;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import("./components/ApexCalendar.vue").CalendarView;
                time: string;
            }) => any;
        } & {
            event?: (props: {
                event: import(".").ResolvedEvent;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import("./components/ApexCalendar.vue").CalendarView;
                time: string;
            }) => any;
        } & {
            event?: (props: {
                event: import(".").ResolvedEvent;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import("./components/ApexCalendar.vue").CalendarView;
                time: string;
            }) => any;
        } & {
            event?: (props: {
                event: import(".").ResolvedEvent;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import("./components/ApexCalendar.vue").CalendarView;
                time: string;
            }) => any;
        } & {
            'list-item'?: (props: {
                day: string;
                event: import(".").ResolvedEvent;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import("./components/ApexCalendar.vue").CalendarView;
                time: string;
            }) => any;
        } & {
            'day-header'?: (props: {
                label: string;
                weekday: number;
                index: number;
                view: string;
            }) => any;
        } & {
            'day-cell'?: (props: {
                day: import(".").DayCell;
                number: string;
                today: boolean;
                outside: boolean;
                hidden: number;
                events: import(".").ResolvedEvent[];
                view: import("./components/ApexCalendar.vue").CalendarView;
            }) => any;
        } & {
            event?: (props: {
                event: import(".").ResolvedEvent;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import("./components/ApexCalendar.vue").CalendarView;
                time: string;
            }) => any;
        } & {
            'scope-prompt'?: (props: {
                event: {
                    source: {
                        [x: string]: unknown;
                        allDay?: false | undefined;
                        start: number;
                        end: number;
                        id: string;
                        title?: string | undefined;
                        type?: string | undefined;
                        background?: boolean | undefined;
                        resourceId?: string | undefined;
                        rrule?: string | null | undefined;
                        exdates?: number[] | undefined;
                        overrides?: Record<string, import(".").RecurrenceOverride> | undefined;
                    } | {
                        [x: string]: unknown;
                        allDay: true;
                        startDate: string;
                        endDate?: string | undefined;
                        start?: number | undefined;
                        end?: number | undefined;
                        id: string;
                        title?: string | undefined;
                        type?: string | undefined;
                        background?: boolean | undefined;
                        resourceId?: string | undefined;
                        rrule?: string | null | undefined;
                        exdates?: number[] | undefined;
                        overrides?: Record<string, import(".").RecurrenceOverride> | undefined;
                    };
                    id: string;
                    instanceId: string;
                    title: string;
                    type?: string | undefined;
                    allDay: boolean;
                    background: boolean;
                    resourceId?: string | undefined;
                    start: number;
                    end: number;
                    startKey: string;
                    endKey: string;
                    dayCount: number;
                    recurring: boolean;
                    originalStart: number;
                    overridden: boolean;
                };
                title: string;
                choose: (scope: import(".").RecurrenceScope) => void;
                cancel: () => void;
                options: {
                    scope: import(".").RecurrenceScope;
                    label: string;
                }[];
            }) => any;
        } & {
            'more-popover'?: (props: {
                events: {
                    source: {
                        [x: string]: unknown;
                        allDay?: false | undefined;
                        start: number;
                        end: number;
                        id: string;
                        title?: string | undefined;
                        type?: string | undefined;
                        background?: boolean | undefined;
                        resourceId?: string | undefined;
                        rrule?: string | null | undefined;
                        exdates?: number[] | undefined;
                        overrides?: Record<string, import(".").RecurrenceOverride> | undefined;
                    } | {
                        [x: string]: unknown;
                        allDay: true;
                        startDate: string;
                        endDate?: string | undefined;
                        start?: number | undefined;
                        end?: number | undefined;
                        id: string;
                        title?: string | undefined;
                        type?: string | undefined;
                        background?: boolean | undefined;
                        resourceId?: string | undefined;
                        rrule?: string | null | undefined;
                        exdates?: number[] | undefined;
                        overrides?: Record<string, import(".").RecurrenceOverride> | undefined;
                    };
                    id: string;
                    instanceId: string;
                    title: string;
                    type?: string | undefined;
                    allDay: boolean;
                    background: boolean;
                    resourceId?: string | undefined;
                    start: number;
                    end: number;
                    startKey: string;
                    endKey: string;
                    dayCount: number;
                    recurring: boolean;
                    originalStart: number;
                    overridden: boolean;
                }[];
                day: string;
                title: string;
                close: () => void;
            }) => any;
        } & {
            event?: (props: {
                event: import(".").ResolvedEvent;
                compact: boolean;
                clipped: {
                    start: boolean;
                    end: boolean;
                };
                tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
                view: import("./components/ApexCalendar.vue").CalendarView;
                time: string;
            }) => any;
        };
    });
    Form: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexOverlayTransition & {
            schema: import(".").FormSchema;
            open?: boolean | null;
            actions?: boolean;
            modelValue?: Record<string, unknown>;
            form?: Record<string, unknown> | null;
            layout?: string;
            shell?: string;
            readonly?: boolean;
            ripple?: boolean;
            eager?: boolean;
            ui?: import("./types").ApexFormClasses;
        }> & Readonly<{
            onCancel?: (() => any) | undefined;
            onChange?: ((v: unknown) => any) | undefined;
            onSubmit?: ((v: unknown) => any) | undefined;
            "onUpdate:modelValue"?: ((v: Record<string, unknown>) => any) | undefined;
            "onUpdate:open"?: ((v: boolean) => any) | undefined;
            "onField-change"?: ((payload: {
                key?: string;
                value: unknown;
            }) => any) | undefined;
        }>, {
            submit: () => void;
            cancel: () => void;
            focusField: (key?: string) => void;
            isOpen: () => boolean;
            reset: () => void;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            cancel: () => any;
            change: (v: unknown) => any;
            submit: (v: unknown) => any;
            "update:modelValue": (v: Record<string, unknown>) => any;
            "update:open": (v: boolean) => any;
            "field-change": (payload: {
                key?: string;
                value: unknown;
            }) => any;
        }, import("vue").PublicProps, {
            form: Record<string, unknown> | null;
            readonly: boolean;
            modelValue: Record<string, unknown>;
            open: boolean | null;
            actions: boolean;
            ripple: boolean;
            eager: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexOverlayTransition & {
            schema: import(".").FormSchema;
            open?: boolean | null;
            actions?: boolean;
            modelValue?: Record<string, unknown>;
            form?: Record<string, unknown> | null;
            layout?: string;
            shell?: string;
            readonly?: boolean;
            ripple?: boolean;
            eager?: boolean;
            ui?: import("./types").ApexFormClasses;
        }> & Readonly<{
            onCancel?: (() => any) | undefined;
            onChange?: ((v: unknown) => any) | undefined;
            onSubmit?: ((v: unknown) => any) | undefined;
            "onUpdate:modelValue"?: ((v: Record<string, unknown>) => any) | undefined;
            "onUpdate:open"?: ((v: boolean) => any) | undefined;
            "onField-change"?: ((payload: {
                key?: string;
                value: unknown;
            }) => any) | undefined;
        }>, {
            submit: () => void;
            cancel: () => void;
            focusField: (key?: string) => void;
            isOpen: () => boolean;
            reset: () => void;
        }, {}, {}, {}, {
            form: Record<string, unknown> | null;
            readonly: boolean;
            modelValue: Record<string, unknown>;
            open: boolean | null;
            actions: boolean;
            ripple: boolean;
            eager: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexOverlayTransition & {
        schema: import(".").FormSchema;
        open?: boolean | null;
        actions?: boolean;
        modelValue?: Record<string, unknown>;
        form?: Record<string, unknown> | null;
        layout?: string;
        shell?: string;
        readonly?: boolean;
        ripple?: boolean;
        eager?: boolean;
        ui?: import("./types").ApexFormClasses;
    }> & Readonly<{
        onCancel?: (() => any) | undefined;
        onChange?: ((v: unknown) => any) | undefined;
        onSubmit?: ((v: unknown) => any) | undefined;
        "onUpdate:modelValue"?: ((v: Record<string, unknown>) => any) | undefined;
        "onUpdate:open"?: ((v: boolean) => any) | undefined;
        "onField-change"?: ((payload: {
            key?: string;
            value: unknown;
        }) => any) | undefined;
    }>, {
        submit: () => void;
        cancel: () => void;
        focusField: (key?: string) => void;
        isOpen: () => boolean;
        reset: () => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        cancel: () => any;
        change: (v: unknown) => any;
        submit: (v: unknown) => any;
        "update:modelValue": (v: Record<string, unknown>) => any;
        "update:open": (v: boolean) => any;
        "field-change": (payload: {
            key?: string;
            value: unknown;
        }) => any;
    }, string, {
        form: Record<string, unknown> | null;
        readonly: boolean;
        modelValue: Record<string, unknown>;
        open: boolean | null;
        actions: boolean;
        ripple: boolean;
        eager: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            [x: string]: ((props: {
                field: import(".").FormField;
                value: unknown;
                error: string[];
                update: (v: unknown) => void;
                blur: () => void;
            }) => any) | undefined;
        } & {
            'head-end'?: (props: {}) => any;
        } & {
            actions?: (props: {
                submit: () => void;
                cancel: () => void;
                processing: boolean;
            }) => any;
        };
    });
    Editor: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            doc?: import("./components/ApexEditor.vue").EditorDoc | null;
            placeholder?: string;
            readonly?: boolean;
            disabled?: boolean;
            autofocus?: boolean;
            minHeight?: string | number;
            maxHeight?: string | number;
            bordered?: boolean;
            size?: "sm" | "md" | "lg";
            spellcheck?: boolean;
            ariaLabel?: string;
            inputRules?: boolean | import(".").InputRuleOptions;
            slashMenu?: boolean;
            slashItems?: import(".").SlashItem[];
            paste?: boolean | import(".").PasteOptions;
            tables?: boolean;
            resizableColumns?: boolean;
            media?: boolean;
            onUpload?: import(".").UploadHandler;
            embedOnPaste?: boolean;
            comments?: boolean;
            activeThread?: string | null;
            resolvedThreads?: string[];
            suggestions?: boolean;
            suggesting?: boolean;
            author?: import(".").SuggestionAuthor;
            sourceView?: boolean;
            assist?: boolean;
            onAssist?: (request: import(".").AssistRequest) => void;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{
            onBlur?: (() => any) | undefined;
            onChange?: ((payload: {
                doc: import("./components/ApexEditor.vue").EditorDoc;
                text: string;
            }) => any) | undefined;
            onFocus?: (() => any) | undefined;
            onPaste?: ((payload: {
                kind: "html" | "markdown" | "text" | "link" | "embed" | "file";
                length: number;
            }) => any) | undefined;
            "onSelection-change"?: ((payload: {
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed: boolean;
            }) => any) | undefined;
            "onUpdate:doc"?: ((doc: import("./components/ApexEditor.vue").EditorDoc) => any) | undefined;
            "onUpload-error"?: ((payload: {
                file: File;
                reason: unknown;
            }) => any) | undefined;
            "onAnchors-change"?: ((payload: import(".").CommentAnchor[]) => any) | undefined;
            "onThread-click"?: ((payload: {
                threadId: string;
            }) => any) | undefined;
            "onSuggestions-change"?: ((payload: import(".").SuggestionRange[]) => any) | undefined;
            "onAssist-request"?: ((payload: import(".").AssistRequest) => any) | undefined;
            "onAssist-error"?: ((payload: {
                action: import(".").AssistAction;
                reason: unknown;
            }) => any) | undefined;
            "onSource-error"?: ((payload: {
                reason: unknown;
                html: string;
            }) => any) | undefined;
            "onClipboard-error"?: ((payload: {
                action: "paste";
                reason: unknown;
            }) => any) | undefined;
            onReady?: (() => any) | undefined;
        }>, {
            getView: () => import("prosemirror-view").EditorView | null;
            getSchema: () => import("prosemirror-model").Schema<any, any> | null;
            focus: () => void | undefined;
            blur: () => void | undefined;
            getJSON: () => any;
            getText: () => string;
            isEmpty: () => boolean;
            getActive: () => {
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed: boolean;
            } | null;
            getLinkContext: () => {
                href: string | null;
                target: string | null;
            };
            getAnchors: () => {
                threadId: string;
                from: number;
                to: number;
                text: string;
                top: number;
                height: number;
            }[];
            addComment: (threadId: string) => boolean;
            removeComment: (threadId: string) => boolean;
            threadsAtSelection: () => string[];
            getSuggestions: () => {
                kind: "insertion" | "deletion";
                authorId: string;
                authorName: string | null;
                at: string | null;
                from: number;
                to: number;
                text: string;
            }[];
            toHtml: (options?: import(".").ExportOptions) => string;
            toMarkdown: (options?: import(".").ExportOptions) => string;
            toText: (options?: import(".").ExportOptions) => string;
            wordCount: (options?: import(".").ExportOptions) => number;
            setHtml: (html: string) => boolean;
            toggleSource: () => boolean;
            isSourceOpen: () => boolean;
            runAssist: (action: import(".").AssistAction, options?: Record<string, unknown>) => boolean;
            isAssistBusy: () => boolean;
            resolveSuggestion: (range: import(".").SuggestionRange, verb: "accept" | "reject") => boolean;
            resolveAll: (verb: "accept" | "reject", authorId?: string) => boolean;
            run: (nameOrFn: string | import("prosemirror-state").Command, dispatchOrValue?: boolean | string | null) => boolean;
            can: (name: string) => boolean;
            commands: () => string[];
            setLink: (attrs: {
                href: string;
                title?: string | null;
                target?: string | null;
            }) => boolean;
            unsetLink: () => boolean;
            insertTable: (rows: number, cols: number) => boolean;
            undo: () => boolean;
            redo: () => boolean;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:doc": (doc: import("./components/ApexEditor.vue").EditorDoc) => void;
            paste: (payload: {
                kind: "html" | "markdown" | "text" | "link" | "embed" | "file";
                length: number;
            }) => void;
            "upload-error": (payload: {
                file: File;
                reason: unknown;
            }) => void;
            "anchors-change": (payload: import(".").CommentAnchor[]) => void;
            "thread-click": (payload: {
                threadId: string;
            }) => void;
            "suggestions-change": (payload: import(".").SuggestionRange[]) => void;
            "assist-request": (payload: import(".").AssistRequest) => void;
            "assist-error": (payload: {
                action: import(".").AssistAction;
                reason: unknown;
            }) => void;
            "source-error": (payload: {
                reason: unknown;
                html: string;
            }) => void;
            "clipboard-error": (payload: {
                action: "paste";
                reason: unknown;
            }) => void;
            change: (payload: {
                doc: import("./components/ApexEditor.vue").EditorDoc;
                text: string;
            }) => void;
            "selection-change": (payload: {
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed: boolean;
            }) => void;
            blur: () => void;
            focus: () => void;
            ready: () => void;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            paste: boolean | import(".").PasteOptions;
            placeholder: string;
            suggestions: boolean;
            spellcheck: boolean;
            bordered: boolean;
            resizableColumns: boolean;
            media: boolean;
            tables: boolean;
            minHeight: string | number;
            inputRules: boolean | import(".").InputRuleOptions;
            slashMenu: boolean;
            embedOnPaste: boolean;
            comments: boolean;
            suggesting: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            doc?: import("./components/ApexEditor.vue").EditorDoc | null;
            placeholder?: string;
            readonly?: boolean;
            disabled?: boolean;
            autofocus?: boolean;
            minHeight?: string | number;
            maxHeight?: string | number;
            bordered?: boolean;
            size?: "sm" | "md" | "lg";
            spellcheck?: boolean;
            ariaLabel?: string;
            inputRules?: boolean | import(".").InputRuleOptions;
            slashMenu?: boolean;
            slashItems?: import(".").SlashItem[];
            paste?: boolean | import(".").PasteOptions;
            tables?: boolean;
            resizableColumns?: boolean;
            media?: boolean;
            onUpload?: import(".").UploadHandler;
            embedOnPaste?: boolean;
            comments?: boolean;
            activeThread?: string | null;
            resolvedThreads?: string[];
            suggestions?: boolean;
            suggesting?: boolean;
            author?: import(".").SuggestionAuthor;
            sourceView?: boolean;
            assist?: boolean;
            onAssist?: (request: import(".").AssistRequest) => void;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{
            onBlur?: (() => any) | undefined;
            onChange?: ((payload: {
                doc: import("./components/ApexEditor.vue").EditorDoc;
                text: string;
            }) => any) | undefined;
            onFocus?: (() => any) | undefined;
            onPaste?: ((payload: {
                kind: "html" | "markdown" | "text" | "link" | "embed" | "file";
                length: number;
            }) => any) | undefined;
            "onSelection-change"?: ((payload: {
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed: boolean;
            }) => any) | undefined;
            "onUpdate:doc"?: ((doc: import("./components/ApexEditor.vue").EditorDoc) => any) | undefined;
            "onUpload-error"?: ((payload: {
                file: File;
                reason: unknown;
            }) => any) | undefined;
            "onAnchors-change"?: ((payload: import(".").CommentAnchor[]) => any) | undefined;
            "onThread-click"?: ((payload: {
                threadId: string;
            }) => any) | undefined;
            "onSuggestions-change"?: ((payload: import(".").SuggestionRange[]) => any) | undefined;
            "onAssist-request"?: ((payload: import(".").AssistRequest) => any) | undefined;
            "onAssist-error"?: ((payload: {
                action: import(".").AssistAction;
                reason: unknown;
            }) => any) | undefined;
            "onSource-error"?: ((payload: {
                reason: unknown;
                html: string;
            }) => any) | undefined;
            "onClipboard-error"?: ((payload: {
                action: "paste";
                reason: unknown;
            }) => any) | undefined;
            onReady?: (() => any) | undefined;
        }>, {
            getView: () => import("prosemirror-view").EditorView | null;
            getSchema: () => import("prosemirror-model").Schema<any, any> | null;
            focus: () => void | undefined;
            blur: () => void | undefined;
            getJSON: () => any;
            getText: () => string;
            isEmpty: () => boolean;
            getActive: () => {
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed: boolean;
            } | null;
            getLinkContext: () => {
                href: string | null;
                target: string | null;
            };
            getAnchors: () => {
                threadId: string;
                from: number;
                to: number;
                text: string;
                top: number;
                height: number;
            }[];
            addComment: (threadId: string) => boolean;
            removeComment: (threadId: string) => boolean;
            threadsAtSelection: () => string[];
            getSuggestions: () => {
                kind: "insertion" | "deletion";
                authorId: string;
                authorName: string | null;
                at: string | null;
                from: number;
                to: number;
                text: string;
            }[];
            toHtml: (options?: import(".").ExportOptions) => string;
            toMarkdown: (options?: import(".").ExportOptions) => string;
            toText: (options?: import(".").ExportOptions) => string;
            wordCount: (options?: import(".").ExportOptions) => number;
            setHtml: (html: string) => boolean;
            toggleSource: () => boolean;
            isSourceOpen: () => boolean;
            runAssist: (action: import(".").AssistAction, options?: Record<string, unknown>) => boolean;
            isAssistBusy: () => boolean;
            resolveSuggestion: (range: import(".").SuggestionRange, verb: "accept" | "reject") => boolean;
            resolveAll: (verb: "accept" | "reject", authorId?: string) => boolean;
            run: (nameOrFn: string | import("prosemirror-state").Command, dispatchOrValue?: boolean | string | null) => boolean;
            can: (name: string) => boolean;
            commands: () => string[];
            setLink: (attrs: {
                href: string;
                title?: string | null;
                target?: string | null;
            }) => boolean;
            unsetLink: () => boolean;
            insertTable: (rows: number, cols: number) => boolean;
            undo: () => boolean;
            redo: () => boolean;
        }, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            paste: boolean | import(".").PasteOptions;
            placeholder: string;
            suggestions: boolean;
            spellcheck: boolean;
            bordered: boolean;
            resizableColumns: boolean;
            media: boolean;
            tables: boolean;
            minHeight: string | number;
            inputRules: boolean | import(".").InputRuleOptions;
            slashMenu: boolean;
            embedOnPaste: boolean;
            comments: boolean;
            suggesting: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        doc?: import("./components/ApexEditor.vue").EditorDoc | null;
        placeholder?: string;
        readonly?: boolean;
        disabled?: boolean;
        autofocus?: boolean;
        minHeight?: string | number;
        maxHeight?: string | number;
        bordered?: boolean;
        size?: "sm" | "md" | "lg";
        spellcheck?: boolean;
        ariaLabel?: string;
        inputRules?: boolean | import(".").InputRuleOptions;
        slashMenu?: boolean;
        slashItems?: import(".").SlashItem[];
        paste?: boolean | import(".").PasteOptions;
        tables?: boolean;
        resizableColumns?: boolean;
        media?: boolean;
        onUpload?: import(".").UploadHandler;
        embedOnPaste?: boolean;
        comments?: boolean;
        activeThread?: string | null;
        resolvedThreads?: string[];
        suggestions?: boolean;
        suggesting?: boolean;
        author?: import(".").SuggestionAuthor;
        sourceView?: boolean;
        assist?: boolean;
        onAssist?: (request: import(".").AssistRequest) => void;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{
        onBlur?: (() => any) | undefined;
        onChange?: ((payload: {
            doc: import("./components/ApexEditor.vue").EditorDoc;
            text: string;
        }) => any) | undefined;
        onFocus?: (() => any) | undefined;
        onPaste?: ((payload: {
            kind: "html" | "markdown" | "text" | "link" | "embed" | "file";
            length: number;
        }) => any) | undefined;
        "onSelection-change"?: ((payload: {
            marks: Record<string, boolean>;
            blockType: string;
            blockAttrs: Record<string, unknown>;
            blockMixed: boolean;
        }) => any) | undefined;
        "onUpdate:doc"?: ((doc: import("./components/ApexEditor.vue").EditorDoc) => any) | undefined;
        "onUpload-error"?: ((payload: {
            file: File;
            reason: unknown;
        }) => any) | undefined;
        "onAnchors-change"?: ((payload: import(".").CommentAnchor[]) => any) | undefined;
        "onThread-click"?: ((payload: {
            threadId: string;
        }) => any) | undefined;
        "onSuggestions-change"?: ((payload: import(".").SuggestionRange[]) => any) | undefined;
        "onAssist-request"?: ((payload: import(".").AssistRequest) => any) | undefined;
        "onAssist-error"?: ((payload: {
            action: import(".").AssistAction;
            reason: unknown;
        }) => any) | undefined;
        "onSource-error"?: ((payload: {
            reason: unknown;
            html: string;
        }) => any) | undefined;
        "onClipboard-error"?: ((payload: {
            action: "paste";
            reason: unknown;
        }) => any) | undefined;
        onReady?: (() => any) | undefined;
    }>, {
        getView: () => import("prosemirror-view").EditorView | null;
        getSchema: () => import("prosemirror-model").Schema<any, any> | null;
        focus: () => void | undefined;
        blur: () => void | undefined;
        getJSON: () => any;
        getText: () => string;
        isEmpty: () => boolean;
        getActive: () => {
            marks: Record<string, boolean>;
            blockType: string;
            blockAttrs: Record<string, unknown>;
            blockMixed: boolean;
        } | null;
        getLinkContext: () => {
            href: string | null;
            target: string | null;
        };
        getAnchors: () => {
            threadId: string;
            from: number;
            to: number;
            text: string;
            top: number;
            height: number;
        }[];
        addComment: (threadId: string) => boolean;
        removeComment: (threadId: string) => boolean;
        threadsAtSelection: () => string[];
        getSuggestions: () => {
            kind: "insertion" | "deletion";
            authorId: string;
            authorName: string | null;
            at: string | null;
            from: number;
            to: number;
            text: string;
        }[];
        toHtml: (options?: import(".").ExportOptions) => string;
        toMarkdown: (options?: import(".").ExportOptions) => string;
        toText: (options?: import(".").ExportOptions) => string;
        wordCount: (options?: import(".").ExportOptions) => number;
        setHtml: (html: string) => boolean;
        toggleSource: () => boolean;
        isSourceOpen: () => boolean;
        runAssist: (action: import(".").AssistAction, options?: Record<string, unknown>) => boolean;
        isAssistBusy: () => boolean;
        resolveSuggestion: (range: import(".").SuggestionRange, verb: "accept" | "reject") => boolean;
        resolveAll: (verb: "accept" | "reject", authorId?: string) => boolean;
        run: (nameOrFn: string | import("prosemirror-state").Command, dispatchOrValue?: boolean | string | null) => boolean;
        can: (name: string) => boolean;
        commands: () => string[];
        setLink: (attrs: {
            href: string;
            title?: string | null;
            target?: string | null;
        }) => boolean;
        unsetLink: () => boolean;
        insertTable: (rows: number, cols: number) => boolean;
        undo: () => boolean;
        redo: () => boolean;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:doc": (doc: import("./components/ApexEditor.vue").EditorDoc) => void;
        paste: (payload: {
            kind: "html" | "markdown" | "text" | "link" | "embed" | "file";
            length: number;
        }) => void;
        "upload-error": (payload: {
            file: File;
            reason: unknown;
        }) => void;
        "anchors-change": (payload: import(".").CommentAnchor[]) => void;
        "thread-click": (payload: {
            threadId: string;
        }) => void;
        "suggestions-change": (payload: import(".").SuggestionRange[]) => void;
        "assist-request": (payload: import(".").AssistRequest) => void;
        "assist-error": (payload: {
            action: import(".").AssistAction;
            reason: unknown;
        }) => void;
        "source-error": (payload: {
            reason: unknown;
            html: string;
        }) => void;
        "clipboard-error": (payload: {
            action: "paste";
            reason: unknown;
        }) => void;
        change: (payload: {
            doc: import("./components/ApexEditor.vue").EditorDoc;
            text: string;
        }) => void;
        "selection-change": (payload: {
            marks: Record<string, boolean>;
            blockType: string;
            blockAttrs: Record<string, unknown>;
            blockMixed: boolean;
        }) => void;
        blur: () => void;
        focus: () => void;
        ready: () => void;
    }, string, {
        size: "sm" | "md" | "lg";
        paste: boolean | import(".").PasteOptions;
        placeholder: string;
        suggestions: boolean;
        spellcheck: boolean;
        bordered: boolean;
        resizableColumns: boolean;
        media: boolean;
        tables: boolean;
        minHeight: string | number;
        inputRules: boolean | import(".").InputRuleOptions;
        slashMenu: boolean;
        embedOnPaste: boolean;
        comments: boolean;
        suggesting: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            toolbar?: (props: {
                active: {
                    marks: Record<string, boolean>;
                    blockType: string;
                    blockAttrs: Record<string, unknown>;
                    blockMixed: boolean;
                } | null;
                run: (nameOrFn: string | import("prosemirror-state").Command, dispatchOrValue?: boolean | string | null) => boolean;
                can: Record<string, boolean>;
                link: {
                    href: string | null;
                    target: string | null;
                };
                setLink: (attrs: {
                    href: string;
                    target?: string | null;
                }) => boolean;
                unsetLink: () => boolean;
                insertTable: (rows: number, cols: number) => boolean;
                view: import("prosemirror-view").EditorView | null;
            }) => any;
        } & {
            loading?: (props: {}) => any;
        } & {
            empty?: (props: {
                placeholder: string;
            }) => any;
        } & {
            gutter?: (props: {
                anchors: {
                    threadId: string;
                    from: number;
                    to: number;
                    text: string;
                    top: number;
                    height: number;
                }[];
                activeThread: string | null | undefined;
            }) => any;
        } & {
            overlay?: (props: {
                active: {
                    marks: Record<string, boolean>;
                    blockType: string;
                    blockAttrs: Record<string, unknown>;
                    blockMixed: boolean;
                } | null;
                run: (nameOrFn: string | import("prosemirror-state").Command, dispatchOrValue?: boolean | string | null) => boolean;
                can: Record<string, boolean>;
                link: {
                    href: string | null;
                    target: string | null;
                };
                setLink: (attrs: {
                    href: string;
                    target?: string | null;
                }) => boolean;
                unsetLink: () => boolean;
                view: import("prosemirror-view").EditorView | null;
                object: {
                    kind: "table" | "image" | "embed";
                    rect: {
                        height: number;
                        width: number;
                        x: number;
                        y: number;
                        readonly bottom: number;
                        readonly left: number;
                        readonly right: number;
                        readonly top: number;
                        toJSON: () => any;
                    };
                } | null;
                measure: () => DOMRect | null;
                bounds: () => DOMRect | null;
                cell: {
                    cellPos: number;
                    tablePos: number;
                    isHeader: boolean;
                    colspan: number;
                    rowspan: number;
                    rows: number;
                    selectedCells: number;
                    style: Record<string, string>;
                    border: {
                        width: string | null;
                        color: string | null;
                    };
                } | null;
                image: Record<string, unknown> | null;
                setCellStyle: (prop: string, value: string | null) => boolean;
            }) => any;
        } & {
            'slash-item'?: (props: {
                item: import(".").SlashItem;
                selected: boolean;
                group: string;
                index: number;
            }) => any;
        } & {
            error?: (props: {
                message: string;
            }) => any;
        } & {
            footer?: (props: {
                active: {
                    marks: Record<string, boolean>;
                    blockType: string;
                    blockAttrs: Record<string, unknown>;
                    blockMixed: boolean;
                } | null;
                run: (nameOrFn: string | import("prosemirror-state").Command, dispatchOrValue?: boolean | string | null) => boolean;
                can: Record<string, boolean>;
            }) => any;
        };
    });
    HTMLEditor: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexFieldProps & {
            html?: string;
            styles?: import(".").HtmlStyle[];
            stylesheets?: string[];
            css?: string;
            bodyClass?: string;
            minHeight?: string;
            editable?: boolean;
            sourceView?: boolean;
            resizableColumns?: boolean;
            resizableRows?: boolean;
            ui?: import("./types").ApexHTMLEditorClasses;
        }> & Readonly<{
            onError?: ((reason: unknown) => any) | undefined;
            "onSelection-change"?: ((payload: import(".").HtmlActiveState) => any) | undefined;
            "onSource-error"?: ((payload: {
                reason: unknown;
                html: string;
            }) => any) | undefined;
            onReady?: (() => any) | undefined;
            "onUpdate:html"?: ((html: string) => any) | undefined;
        }>, {
            getView: () => import("prosemirror-view").EditorView | null;
            getSchema: () => import("prosemirror-model").Schema<any, any> | null;
            getHtml: () => string;
            setHtml: (html: string) => boolean;
            getActive: () => {
                blockStyle: string | null;
                characterStyle: string | null;
                path: {
                    depth: number;
                    tag: string;
                    pos: number;
                }[];
                textStyle: {
                    color: string | null;
                    fontFamily: string | null;
                    fontSize: string | null;
                    mixed: boolean;
                };
                cell: {
                    cellPos: number;
                    tablePos: number;
                    isHeader: boolean;
                    colspan: number;
                    rowspan: number;
                    rows: number;
                    selectedCells: number;
                    style: Record<string, string>;
                    border: {
                        width: string | null;
                        color: string | null;
                    };
                } | null;
                object: {
                    kind: "table" | "image" | "embed";
                    rect: {
                        height: number;
                        width: number;
                        x: number;
                        y: number;
                        readonly bottom: number;
                        readonly left: number;
                        readonly right: number;
                        readonly top: number;
                        toJSON: () => any;
                    };
                } | null;
                sourceOpen?: boolean | undefined;
                showBlocks?: boolean | undefined;
                visualAids?: boolean | undefined;
                fullscreen?: boolean | undefined;
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed: boolean;
            };
            applyStyle: (style: import(".").HtmlStyle | null) => boolean;
            clearStyle: (scope: "block" | "character") => boolean;
            selectPath: (entry: import(".").HtmlPathEntry) => void;
            run: (name: string | ((...a: never[]) => boolean), value?: unknown) => boolean;
            canRun: (name: string) => boolean;
            setLink: (attrs: {
                href: string;
                target?: string | null;
            }) => boolean;
            unsetLink: () => boolean;
            getLinkContext: () => {
                href: string;
                target: string | null;
            };
            setTextStyle: (kind: string, value: string | null) => boolean;
            setCellStyle: (prop: string, value: string | null) => boolean;
            insertImage: (attrs: Record<string, unknown>) => boolean;
            getCommands: () => Record<string, boolean>;
            structure: (action: import("./components/ApexHTMLEditor.vue").StructureAction, arg?: unknown) => boolean;
            canStructure: (action: import("./components/ApexHTMLEditor.vue").StructureAction, arg?: unknown) => boolean;
            toggleSource: () => boolean;
            isSourceOpen: () => boolean;
            focus: () => void | undefined;
            isReady: () => boolean;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            error: (reason: unknown) => any;
            "selection-change": (payload: import(".").HtmlActiveState) => any;
            "source-error": (payload: {
                reason: unknown;
                html: string;
            }) => any;
            ready: () => any;
            "update:html": (html: string) => any;
        }, import("vue").PublicProps, {
            html: string;
            resizableColumns: boolean;
            editable: boolean;
            minHeight: string;
            sourceView: boolean;
            resizableRows: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexFieldProps & {
            html?: string;
            styles?: import(".").HtmlStyle[];
            stylesheets?: string[];
            css?: string;
            bodyClass?: string;
            minHeight?: string;
            editable?: boolean;
            sourceView?: boolean;
            resizableColumns?: boolean;
            resizableRows?: boolean;
            ui?: import("./types").ApexHTMLEditorClasses;
        }> & Readonly<{
            onError?: ((reason: unknown) => any) | undefined;
            "onSelection-change"?: ((payload: import(".").HtmlActiveState) => any) | undefined;
            "onSource-error"?: ((payload: {
                reason: unknown;
                html: string;
            }) => any) | undefined;
            onReady?: (() => any) | undefined;
            "onUpdate:html"?: ((html: string) => any) | undefined;
        }>, {
            getView: () => import("prosemirror-view").EditorView | null;
            getSchema: () => import("prosemirror-model").Schema<any, any> | null;
            getHtml: () => string;
            setHtml: (html: string) => boolean;
            getActive: () => {
                blockStyle: string | null;
                characterStyle: string | null;
                path: {
                    depth: number;
                    tag: string;
                    pos: number;
                }[];
                textStyle: {
                    color: string | null;
                    fontFamily: string | null;
                    fontSize: string | null;
                    mixed: boolean;
                };
                cell: {
                    cellPos: number;
                    tablePos: number;
                    isHeader: boolean;
                    colspan: number;
                    rowspan: number;
                    rows: number;
                    selectedCells: number;
                    style: Record<string, string>;
                    border: {
                        width: string | null;
                        color: string | null;
                    };
                } | null;
                object: {
                    kind: "table" | "image" | "embed";
                    rect: {
                        height: number;
                        width: number;
                        x: number;
                        y: number;
                        readonly bottom: number;
                        readonly left: number;
                        readonly right: number;
                        readonly top: number;
                        toJSON: () => any;
                    };
                } | null;
                sourceOpen?: boolean | undefined;
                showBlocks?: boolean | undefined;
                visualAids?: boolean | undefined;
                fullscreen?: boolean | undefined;
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed: boolean;
            };
            applyStyle: (style: import(".").HtmlStyle | null) => boolean;
            clearStyle: (scope: "block" | "character") => boolean;
            selectPath: (entry: import(".").HtmlPathEntry) => void;
            run: (name: string | ((...a: never[]) => boolean), value?: unknown) => boolean;
            canRun: (name: string) => boolean;
            setLink: (attrs: {
                href: string;
                target?: string | null;
            }) => boolean;
            unsetLink: () => boolean;
            getLinkContext: () => {
                href: string;
                target: string | null;
            };
            setTextStyle: (kind: string, value: string | null) => boolean;
            setCellStyle: (prop: string, value: string | null) => boolean;
            insertImage: (attrs: Record<string, unknown>) => boolean;
            getCommands: () => Record<string, boolean>;
            structure: (action: import("./components/ApexHTMLEditor.vue").StructureAction, arg?: unknown) => boolean;
            canStructure: (action: import("./components/ApexHTMLEditor.vue").StructureAction, arg?: unknown) => boolean;
            toggleSource: () => boolean;
            isSourceOpen: () => boolean;
            focus: () => void | undefined;
            isReady: () => boolean;
        }, {}, {}, {}, {
            html: string;
            resizableColumns: boolean;
            editable: boolean;
            minHeight: string;
            sourceView: boolean;
            resizableRows: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexFieldProps & {
        html?: string;
        styles?: import(".").HtmlStyle[];
        stylesheets?: string[];
        css?: string;
        bodyClass?: string;
        minHeight?: string;
        editable?: boolean;
        sourceView?: boolean;
        resizableColumns?: boolean;
        resizableRows?: boolean;
        ui?: import("./types").ApexHTMLEditorClasses;
    }> & Readonly<{
        onError?: ((reason: unknown) => any) | undefined;
        "onSelection-change"?: ((payload: import(".").HtmlActiveState) => any) | undefined;
        "onSource-error"?: ((payload: {
            reason: unknown;
            html: string;
        }) => any) | undefined;
        onReady?: (() => any) | undefined;
        "onUpdate:html"?: ((html: string) => any) | undefined;
    }>, {
        getView: () => import("prosemirror-view").EditorView | null;
        getSchema: () => import("prosemirror-model").Schema<any, any> | null;
        getHtml: () => string;
        setHtml: (html: string) => boolean;
        getActive: () => {
            blockStyle: string | null;
            characterStyle: string | null;
            path: {
                depth: number;
                tag: string;
                pos: number;
            }[];
            textStyle: {
                color: string | null;
                fontFamily: string | null;
                fontSize: string | null;
                mixed: boolean;
            };
            cell: {
                cellPos: number;
                tablePos: number;
                isHeader: boolean;
                colspan: number;
                rowspan: number;
                rows: number;
                selectedCells: number;
                style: Record<string, string>;
                border: {
                    width: string | null;
                    color: string | null;
                };
            } | null;
            object: {
                kind: "table" | "image" | "embed";
                rect: {
                    height: number;
                    width: number;
                    x: number;
                    y: number;
                    readonly bottom: number;
                    readonly left: number;
                    readonly right: number;
                    readonly top: number;
                    toJSON: () => any;
                };
            } | null;
            sourceOpen?: boolean | undefined;
            showBlocks?: boolean | undefined;
            visualAids?: boolean | undefined;
            fullscreen?: boolean | undefined;
            marks: Record<string, boolean>;
            blockType: string;
            blockAttrs: Record<string, unknown>;
            blockMixed: boolean;
        };
        applyStyle: (style: import(".").HtmlStyle | null) => boolean;
        clearStyle: (scope: "block" | "character") => boolean;
        selectPath: (entry: import(".").HtmlPathEntry) => void;
        run: (name: string | ((...a: never[]) => boolean), value?: unknown) => boolean;
        canRun: (name: string) => boolean;
        setLink: (attrs: {
            href: string;
            target?: string | null;
        }) => boolean;
        unsetLink: () => boolean;
        getLinkContext: () => {
            href: string;
            target: string | null;
        };
        setTextStyle: (kind: string, value: string | null) => boolean;
        setCellStyle: (prop: string, value: string | null) => boolean;
        insertImage: (attrs: Record<string, unknown>) => boolean;
        getCommands: () => Record<string, boolean>;
        structure: (action: import("./components/ApexHTMLEditor.vue").StructureAction, arg?: unknown) => boolean;
        canStructure: (action: import("./components/ApexHTMLEditor.vue").StructureAction, arg?: unknown) => boolean;
        toggleSource: () => boolean;
        isSourceOpen: () => boolean;
        focus: () => void | undefined;
        isReady: () => boolean;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        error: (reason: unknown) => any;
        "selection-change": (payload: import(".").HtmlActiveState) => any;
        "source-error": (payload: {
            reason: unknown;
            html: string;
        }) => any;
        ready: () => any;
        "update:html": (html: string) => any;
    }, string, {
        html: string;
        resizableColumns: boolean;
        editable: boolean;
        minHeight: string;
        sourceView: boolean;
        resizableRows: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            error?: (props: {
                message: string;
            }) => any;
        } & {
            toolbar?: (props: {
                styles: import(".").HtmlStyle[];
                blockStyles: import(".").HtmlStyle[];
                characterStyles: import(".").HtmlStyle[];
                active: {
                    blockStyle: string | null;
                    characterStyle: string | null;
                    path: {
                        depth: number;
                        tag: string;
                        pos: number;
                    }[];
                    textStyle: {
                        color: string | null;
                        fontFamily: string | null;
                        fontSize: string | null;
                        mixed: boolean;
                    };
                    cell: {
                        cellPos: number;
                        tablePos: number;
                        isHeader: boolean;
                        colspan: number;
                        rowspan: number;
                        rows: number;
                        selectedCells: number;
                        style: Record<string, string>;
                        border: {
                            width: string | null;
                            color: string | null;
                        };
                    } | null;
                    object: {
                        kind: "table" | "image" | "embed";
                        rect: {
                            height: number;
                            width: number;
                            x: number;
                            y: number;
                            readonly bottom: number;
                            readonly left: number;
                            readonly right: number;
                            readonly top: number;
                            toJSON: () => any;
                        };
                    } | null;
                    sourceOpen?: boolean | undefined;
                    showBlocks?: boolean | undefined;
                    visualAids?: boolean | undefined;
                    fullscreen?: boolean | undefined;
                    marks: Record<string, boolean>;
                    blockType: string;
                    blockAttrs: Record<string, unknown>;
                    blockMixed: boolean;
                };
                apply: (style: import(".").HtmlStyle | null) => boolean;
                clear: (scope: "block" | "character") => boolean;
                structure: (action: import("./components/ApexHTMLEditor.vue").StructureAction, arg?: unknown) => boolean;
                can: (action: import("./components/ApexHTMLEditor.vue").StructureAction, arg?: unknown) => boolean;
                containers: {
                    value: string;
                    label: string;
                }[];
                sourceOpen: boolean;
                toggleSource: () => boolean;
                run: (name: string | ((...a: never[]) => boolean), value?: unknown) => boolean;
                canRun: (name: string) => boolean;
                commands: Record<string, boolean>;
                objectRect: () => DOMRect | null;
                linkRequest: number;
                imageRequest: number;
                imageAttrs: Record<string, string> | null;
                applyImage: (attrs: Record<string, string>) => boolean;
                tableRequest: number;
                insertTable: (rows: number, cols: number) => boolean;
                countRequest: number;
                wordStats: () => {
                    doc: null;
                    selection: null;
                } | {
                    doc: {
                        words: number;
                        chars: number;
                        charsNoSpaces: number;
                        blocks: number;
                    };
                    selection: {
                        words: number;
                        chars: number;
                        charsNoSpaces: number;
                        blocks: number;
                    } | null;
                };
                setLink: (attrs: {
                    href: string;
                    target?: string | null;
                }) => boolean;
                unsetLink: () => boolean;
                linkContext: () => {
                    href: string;
                    target: string | null;
                };
                setTextStyle: (kind: string, value: string | null) => boolean;
                insertImage: (attrs: Record<string, unknown>) => boolean;
                cell: {
                    cellPos: number;
                    tablePos: number;
                    isHeader: boolean;
                    colspan: number;
                    rowspan: number;
                    rows: number;
                    selectedCells: number;
                    style: Record<string, string>;
                    border: {
                        width: string | null;
                        color: string | null;
                    };
                } | null;
                setCellStyle: (prop: string, value: string | null) => boolean;
            }) => any;
        } & {
            'source-view'?: (props: {
                text: string;
                setText: (v: string) => void;
                error: string;
            }) => any;
        } & {
            loading?: (props: {}) => any;
        } & {
            status?: (props: {
                path: {
                    depth: number;
                    tag: string;
                    pos: number;
                }[];
                words: number;
                selectPath: (entry: import(".").HtmlPathEntry) => void;
                sourceOpen: boolean;
            }) => any;
        };
    });
    EditorToolbar: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            active?: {
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed?: boolean;
            } | null;
            can?: Record<string, boolean>;
            run?: (name: string) => boolean;
            items?: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[];
            exclude?: string[];
            overflowItems?: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[] | null;
            preset?: import("./components/ApexEditorToolbar.vue").ToolbarPreset;
            size?: "sm" | "md";
            sticky?: boolean;
            wrap?: boolean;
            disabled?: boolean;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{
            onCommand?: ((payload: {
                command: string;
                applied: boolean;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            command: (payload: {
                command: string;
                applied: boolean;
            }) => any;
        }, import("vue").PublicProps, {
            size: "sm" | "md";
            wrap: boolean;
            overflowItems: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[] | null;
            preset: import("./components/ApexEditorToolbar.vue").ToolbarPreset;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            active?: {
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed?: boolean;
            } | null;
            can?: Record<string, boolean>;
            run?: (name: string) => boolean;
            items?: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[];
            exclude?: string[];
            overflowItems?: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[] | null;
            preset?: import("./components/ApexEditorToolbar.vue").ToolbarPreset;
            size?: "sm" | "md";
            sticky?: boolean;
            wrap?: boolean;
            disabled?: boolean;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{
            onCommand?: ((payload: {
                command: string;
                applied: boolean;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, {
            size: "sm" | "md";
            wrap: boolean;
            overflowItems: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[] | null;
            preset: import("./components/ApexEditorToolbar.vue").ToolbarPreset;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        active?: {
            marks: Record<string, boolean>;
            blockType: string;
            blockAttrs: Record<string, unknown>;
            blockMixed?: boolean;
        } | null;
        can?: Record<string, boolean>;
        run?: (name: string) => boolean;
        items?: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[];
        exclude?: string[];
        overflowItems?: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[] | null;
        preset?: import("./components/ApexEditorToolbar.vue").ToolbarPreset;
        size?: "sm" | "md";
        sticky?: boolean;
        wrap?: boolean;
        disabled?: boolean;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{
        onCommand?: ((payload: {
            command: string;
            applied: boolean;
        }) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        command: (payload: {
            command: string;
            applied: boolean;
        }) => any;
    }, string, {
        size: "sm" | "md";
        wrap: boolean;
        overflowItems: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[] | null;
        preset: import("./components/ApexEditorToolbar.vue").ToolbarPreset;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            [x: string]: ((props: {
                item: import("./core/editor/catalogue").ResolvedItem;
                active: {
                    marks: Record<string, boolean>;
                    blockType: string;
                    blockAttrs: Record<string, unknown>;
                    blockMixed?: boolean;
                } | null | undefined;
                can: Record<string, boolean> | undefined;
                run: ((name: string) => boolean) | undefined;
            }) => any) | undefined;
        } & {
            end?: (props: {}) => any;
        };
    });
    EditorMenubar: import("vue").DefineComponent<{
        run?: (name: string, value?: unknown) => boolean;
        can?: Record<string, boolean> | null;
        active?: Record<string, unknown> | null;
        exclude?: string[];
        insertTable?: ((rows: number, cols: number) => boolean) | null;
        ui?: import("./types").ApexEditorClasses;
    }, {
        catalogue: Record<string, import(".").CommandSpec>;
        unreachableCommands: typeof import(".").unreachableCommands;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        command: (payload: {
            command: string;
            value?: unknown;
            applied: boolean;
        }) => any;
    }, string, import("vue").PublicProps, Readonly<{
        run?: (name: string, value?: unknown) => boolean;
        can?: Record<string, boolean> | null;
        active?: Record<string, unknown> | null;
        exclude?: string[];
        insertTable?: ((rows: number, cols: number) => boolean) | null;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{
        onCommand?: ((payload: {
            command: string;
            value?: unknown;
            applied: boolean;
        }) => any) | undefined;
    }>, {
        insertTable: ((rows: number, cols: number) => boolean) | null;
        exclude: string[];
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    EditorBubble: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            view?: unknown;
            active?: {
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed?: boolean;
            } | null;
            can?: Record<string, boolean>;
            run?: (name: string) => boolean;
            items?: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[];
            onCaret?: boolean;
            offset?: number;
            disabled?: boolean;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            offset: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            view?: unknown;
            active?: {
                marks: Record<string, boolean>;
                blockType: string;
                blockAttrs: Record<string, unknown>;
                blockMixed?: boolean;
            } | null;
            can?: Record<string, boolean>;
            run?: (name: string) => boolean;
            items?: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[];
            onCaret?: boolean;
            offset?: number;
            disabled?: boolean;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            offset: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        view?: unknown;
        active?: {
            marks: Record<string, boolean>;
            blockType: string;
            blockAttrs: Record<string, unknown>;
            blockMixed?: boolean;
        } | null;
        can?: Record<string, boolean>;
        run?: (name: string) => boolean;
        items?: (import("./components/ApexEditorToolbar.vue").ToolbarItem | string)[];
        onCaret?: boolean;
        offset?: number;
        disabled?: boolean;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        offset: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            link?: (props: {
                item: import("./core/editor/catalogue").ResolvedItem;
                active: {
                    marks: Record<string, boolean>;
                    blockType: string;
                    blockAttrs: Record<string, unknown>;
                    blockMixed?: boolean;
                } | null | undefined;
                can: Record<string, boolean> | undefined;
                run: ((name: string) => boolean) | undefined;
            }) => any;
        };
    });
    EditorTableGrid: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            openRequest?: number;
            insert?: ((rows: number, cols: number) => boolean) | null;
            disabled?: boolean;
            inline?: boolean;
            rows?: number;
            cols?: number;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{
            onInsert?: ((payload: {
                rows: number;
                cols: number;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            insert: (payload: {
                rows: number;
                cols: number;
            }) => any;
        }, import("vue").PublicProps, {
            rows: number;
            cols: number;
            insert: ((rows: number, cols: number) => boolean) | null;
            openRequest: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            openRequest?: number;
            insert?: ((rows: number, cols: number) => boolean) | null;
            disabled?: boolean;
            inline?: boolean;
            rows?: number;
            cols?: number;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{
            onInsert?: ((payload: {
                rows: number;
                cols: number;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, {
            rows: number;
            cols: number;
            insert: ((rows: number, cols: number) => boolean) | null;
            openRequest: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        openRequest?: number;
        insert?: ((rows: number, cols: number) => boolean) | null;
        disabled?: boolean;
        inline?: boolean;
        rows?: number;
        cols?: number;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{
        onInsert?: ((payload: {
            rows: number;
            cols: number;
        }) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        insert: (payload: {
            rows: number;
            cols: number;
        }) => any;
    }, string, {
        rows: number;
        cols: number;
        insert: ((rows: number, cols: number) => boolean) | null;
        openRequest: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            readout?: (props: {
                rows: number;
                cols: number;
                text: string;
            }) => any;
        };
    });
    EditorImage: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            openRequest?: number;
            attrs?: import("./components/ApexEditorImage.vue").ImageAttrs | null;
            upload?: ((file: File) => string | Promise<string>) | null;
            disabled?: boolean;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{
            onApply?: ((attrs: Record<string, string>) => any) | undefined;
        }>, {
            show: () => void;
            hide: () => void;
            save: () => void;
            cancel: () => void;
            draft: import("vue").Ref<{
                src: string;
                alt: string;
                width: string;
                height: string;
            }, {
                src: string;
                alt: string;
                width: string;
                height: string;
            } | {
                src: string;
                alt: string;
                width: string;
                height: string;
            }>;
            decorative: import("vue").Ref<boolean, boolean>;
            error: import("vue").Ref<string, string>;
            onWidth: () => void;
            onHeight: () => void;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            apply: (attrs: Record<string, string>) => any;
        }, import("vue").PublicProps, {
            attrs: import("./components/ApexEditorImage.vue").ImageAttrs | null;
            upload: ((file: File) => string | Promise<string>) | null;
            openRequest: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            openRequest?: number;
            attrs?: import("./components/ApexEditorImage.vue").ImageAttrs | null;
            upload?: ((file: File) => string | Promise<string>) | null;
            disabled?: boolean;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{
            onApply?: ((attrs: Record<string, string>) => any) | undefined;
        }>, {
            show: () => void;
            hide: () => void;
            save: () => void;
            cancel: () => void;
            draft: import("vue").Ref<{
                src: string;
                alt: string;
                width: string;
                height: string;
            }, {
                src: string;
                alt: string;
                width: string;
                height: string;
            } | {
                src: string;
                alt: string;
                width: string;
                height: string;
            }>;
            decorative: import("vue").Ref<boolean, boolean>;
            error: import("vue").Ref<string, string>;
            onWidth: () => void;
            onHeight: () => void;
        }, {}, {}, {}, {
            attrs: import("./components/ApexEditorImage.vue").ImageAttrs | null;
            upload: ((file: File) => string | Promise<string>) | null;
            openRequest: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        openRequest?: number;
        attrs?: import("./components/ApexEditorImage.vue").ImageAttrs | null;
        upload?: ((file: File) => string | Promise<string>) | null;
        disabled?: boolean;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{
        onApply?: ((attrs: Record<string, string>) => any) | undefined;
    }>, {
        show: () => void;
        hide: () => void;
        save: () => void;
        cancel: () => void;
        draft: import("vue").Ref<{
            src: string;
            alt: string;
            width: string;
            height: string;
        }, {
            src: string;
            alt: string;
            width: string;
            height: string;
        } | {
            src: string;
            alt: string;
            width: string;
            height: string;
        }>;
        decorative: import("vue").Ref<boolean, boolean>;
        error: import("vue").Ref<string, string>;
        onWidth: () => void;
        onHeight: () => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        apply: (attrs: Record<string, string>) => any;
    }, string, {
        attrs: import("./components/ApexEditorImage.vue").ImageAttrs | null;
        upload: ((file: File) => string | Promise<string>) | null;
        openRequest: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            fields?: (props: {
                draft: {
                    src: string;
                    alt: string;
                    width: string;
                    height: string;
                };
                editing: boolean;
            }) => any;
        } & {
            footer?: (props: {
                draft: {
                    src: string;
                    alt: string;
                    width: string;
                    height: string;
                };
                editing: boolean;
                save: () => void;
                cancel: () => void;
                canSave: boolean;
            }) => any;
        };
    });
    EditorLink: import("vue").DefineComponent<{
        active?: {
            marks: Record<string, boolean>;
        } | null;
        href?: string | null;
        target?: string | null;
        disabled?: boolean;
        openRequest?: number;
        defaultScheme?: string;
        ui?: import("./types").ApexEditorClasses;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        remove: () => any;
        apply: (payload: {
            href: string;
            target: string | null;
        }) => any;
    }, string, import("vue").PublicProps, Readonly<{
        active?: {
            marks: Record<string, boolean>;
        } | null;
        href?: string | null;
        target?: string | null;
        disabled?: boolean;
        openRequest?: number;
        defaultScheme?: string;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{
        onRemove?: (() => any) | undefined;
        onApply?: ((payload: {
            href: string;
            target: string | null;
        }) => any) | undefined;
    }>, {
        openRequest: number;
        defaultScheme: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    EditorTableTools: import("vue").DefineComponent<{
        cell?: import(".").CellStyleState | null;
        run?: (name: string, value?: string | null) => boolean;
        can?: Record<string, boolean> | null;
        setCellStyle?: (prop: string, value: string | null) => void;
        items?: import(".").SurfaceItem[];
        disabled?: boolean;
        ui?: import("./types").ApexEditorClasses;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{
        cell?: import(".").CellStyleState | null;
        run?: (name: string, value?: string | null) => boolean;
        can?: Record<string, boolean> | null;
        setCellStyle?: (prop: string, value: string | null) => void;
        items?: import(".").SurfaceItem[];
        disabled?: boolean;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{}>, {
        items: import(".").SurfaceItem[];
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    EditorObjectBar: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            rect?: DOMRect | null;
            measure?: (() => DOMRect | null) | null;
            bounds?: (() => DOMRect | null) | null;
            kind?: string;
            side?: import(".").AnchorSide;
            gap?: number;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            rect: DOMRect | null;
            side: import(".").AnchorSide;
            gap: number;
            kind: string;
            measure: (() => DOMRect | null) | null;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            rect?: DOMRect | null;
            measure?: (() => DOMRect | null) | null;
            bounds?: (() => DOMRect | null) | null;
            kind?: string;
            side?: import(".").AnchorSide;
            gap?: number;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            rect: DOMRect | null;
            side: import(".").AnchorSide;
            gap: number;
            kind: string;
            measure: (() => DOMRect | null) | null;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        rect?: DOMRect | null;
        measure?: (() => DOMRect | null) | null;
        bounds?: (() => DOMRect | null) | null;
        kind?: string;
        side?: import(".").AnchorSide;
        gap?: number;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        rect: DOMRect | null;
        side: import(".").AnchorSide;
        gap: number;
        kind: string;
        measure: (() => DOMRect | null) | null;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    EditorImageTools: import("vue").DefineComponent<{
        image?: import("./components/ApexEditorImageTools.vue").ImageState | null;
        run?: (name: string, value?: string | null) => boolean;
        can?: Record<string, boolean> | null;
        disabled?: boolean;
        ui?: import("./types").ApexEditorClasses;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        edit: () => any;
    }, string, import("vue").PublicProps, Readonly<{
        image?: import("./components/ApexEditorImageTools.vue").ImageState | null;
        run?: (name: string, value?: string | null) => boolean;
        can?: Record<string, boolean> | null;
        disabled?: boolean;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{
        onEdit?: (() => any) | undefined;
    }>, {
        image: import("./components/ApexEditorImageTools.vue").ImageState | null;
        disabled: boolean;
        can: Record<string, boolean> | null;
        run: (name: string, value?: string | null) => boolean;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    EditorWordCount: import("vue").DefineComponent<{
        openRequest?: number;
        stats?: (() => {
            doc: import("./components/ApexEditorWordCount.vue").WordCountStats | null;
            selection: import("./components/ApexEditorWordCount.vue").WordCountStats | null;
        }) | null;
        ui?: import("./types").ApexEditorClasses;
    }, {
        show: () => void;
        hide: () => void;
        doc: import("vue").Ref<{
            words: number;
            chars: number;
            charsNoSpaces: number;
            blocks: number;
        } | null, import("./components/ApexEditorWordCount.vue").WordCountStats | {
            words: number;
            chars: number;
            charsNoSpaces: number;
            blocks: number;
        } | null>;
        selection: import("vue").Ref<{
            words: number;
            chars: number;
            charsNoSpaces: number;
            blocks: number;
        } | null, import("./components/ApexEditorWordCount.vue").WordCountStats | {
            words: number;
            chars: number;
            charsNoSpaces: number;
            blocks: number;
        } | null>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{
        openRequest?: number;
        stats?: (() => {
            doc: import("./components/ApexEditorWordCount.vue").WordCountStats | null;
            selection: import("./components/ApexEditorWordCount.vue").WordCountStats | null;
        }) | null;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{}>, {
        openRequest: number;
        stats: (() => {
            doc: import("./components/ApexEditorWordCount.vue").WordCountStats | null;
            selection: import("./components/ApexEditorWordCount.vue").WordCountStats | null;
        }) | null;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    EditorSlash: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            state?: import(".").SlashState | null;
            items?: import(".").SlashItem[];
            coords?: {
                x: number;
                y: number;
            } | null;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{
            onClose?: (() => any) | undefined;
            onChoose?: ((payload: {
                item: import(".").SlashItem;
                state: import(".").SlashState;
            }) => any) | undefined;
        }>, {
            handleKey: (key: string) => boolean;
            hasItems: () => boolean;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            close: () => any;
            choose: (payload: {
                item: import(".").SlashItem;
                state: import(".").SlashState;
            }) => any;
        }, import("vue").PublicProps, {}, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            state?: import(".").SlashState | null;
            items?: import(".").SlashItem[];
            coords?: {
                x: number;
                y: number;
            } | null;
            ui?: import("./types").ApexEditorClasses;
        }> & Readonly<{
            onClose?: (() => any) | undefined;
            onChoose?: ((payload: {
                item: import(".").SlashItem;
                state: import(".").SlashState;
            }) => any) | undefined;
        }>, {
            handleKey: (key: string) => boolean;
            hasItems: () => boolean;
        }, {}, {}, {}, {}>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        state?: import(".").SlashState | null;
        items?: import(".").SlashItem[];
        coords?: {
            x: number;
            y: number;
        } | null;
        ui?: import("./types").ApexEditorClasses;
    }> & Readonly<{
        onClose?: (() => any) | undefined;
        onChoose?: ((payload: {
            item: import(".").SlashItem;
            state: import(".").SlashState;
        }) => any) | undefined;
    }>, {
        handleKey: (key: string) => boolean;
        hasItems: () => boolean;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        close: () => any;
        choose: (payload: {
            item: import(".").SlashItem;
            state: import(".").SlashState;
        }) => any;
    }, string, {}, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            item?: (props: {
                item: import(".").SlashItem;
                selected: boolean;
                group: string;
                index: number;
            }) => any;
        };
    });
    Accordion: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexContainerProps & {
            items?: import(".").AccordionPanel[];
            value?: string | number | Array<string | number> | null;
            multiple?: boolean;
            collapsible?: boolean;
            lazy?: boolean;
            togglePosition?: "start" | "end";
            expandIcon?: string;
            collapseIcon?: string;
            gap?: string;
            bordered?: boolean;
            size?: "sm" | "md" | "lg";
            headerBackground?: string;
            headerColor?: string;
            activeBackground?: string;
            activeColor?: string;
            contentBackground?: string;
            borderColor?: string;
            radius?: string;
        }> & Readonly<{
            "onUpdate:value"?: ((v: string | number | (string | number)[] | null) => any) | undefined;
            "onPanel-open"?: ((panel: import(".").AccordionPanel) => any) | undefined;
            "onPanel-close"?: ((panel: import(".").AccordionPanel) => any) | undefined;
        }>, {
            toggle: (panel: import(".").AccordionPanel) => void;
            isOpen: (panel: import(".").AccordionPanel) => boolean;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:value": (v: string | number | (string | number)[] | null) => void;
            "panel-open": (panel: import(".").AccordionPanel) => void;
            "panel-close": (panel: import(".").AccordionPanel) => void;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            bordered: boolean;
            expandIcon: string;
            collapseIcon: string;
            collapsible: boolean;
            togglePosition: "start" | "end";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexContainerProps & {
            items?: import(".").AccordionPanel[];
            value?: string | number | Array<string | number> | null;
            multiple?: boolean;
            collapsible?: boolean;
            lazy?: boolean;
            togglePosition?: "start" | "end";
            expandIcon?: string;
            collapseIcon?: string;
            gap?: string;
            bordered?: boolean;
            size?: "sm" | "md" | "lg";
            headerBackground?: string;
            headerColor?: string;
            activeBackground?: string;
            activeColor?: string;
            contentBackground?: string;
            borderColor?: string;
            radius?: string;
        }> & Readonly<{
            "onUpdate:value"?: ((v: string | number | (string | number)[] | null) => any) | undefined;
            "onPanel-open"?: ((panel: import(".").AccordionPanel) => any) | undefined;
            "onPanel-close"?: ((panel: import(".").AccordionPanel) => any) | undefined;
        }>, {
            toggle: (panel: import(".").AccordionPanel) => void;
            isOpen: (panel: import(".").AccordionPanel) => boolean;
        }, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            bordered: boolean;
            expandIcon: string;
            collapseIcon: string;
            collapsible: boolean;
            togglePosition: "start" | "end";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexContainerProps & {
        items?: import(".").AccordionPanel[];
        value?: string | number | Array<string | number> | null;
        multiple?: boolean;
        collapsible?: boolean;
        lazy?: boolean;
        togglePosition?: "start" | "end";
        expandIcon?: string;
        collapseIcon?: string;
        gap?: string;
        bordered?: boolean;
        size?: "sm" | "md" | "lg";
        headerBackground?: string;
        headerColor?: string;
        activeBackground?: string;
        activeColor?: string;
        contentBackground?: string;
        borderColor?: string;
        radius?: string;
    }> & Readonly<{
        "onUpdate:value"?: ((v: string | number | (string | number)[] | null) => any) | undefined;
        "onPanel-open"?: ((panel: import(".").AccordionPanel) => any) | undefined;
        "onPanel-close"?: ((panel: import(".").AccordionPanel) => any) | undefined;
    }>, {
        toggle: (panel: import(".").AccordionPanel) => void;
        isOpen: (panel: import(".").AccordionPanel) => boolean;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:value": (v: string | number | (string | number)[] | null) => void;
        "panel-open": (panel: import(".").AccordionPanel) => void;
        "panel-close": (panel: import(".").AccordionPanel) => void;
    }, string, {
        size: "sm" | "md" | "lg";
        bordered: boolean;
        expandIcon: string;
        collapseIcon: string;
        collapsible: boolean;
        togglePosition: "start" | "end";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            toggleicon?: (props: {
                panel: import(".").AccordionPanel;
                active: boolean;
            }) => any;
        } & {
            header?: (props: {
                panel: import(".").AccordionPanel;
                active: boolean;
                index: number;
            }) => any;
        } & {
            content?: (props: {
                panel: import(".").AccordionPanel;
                active: boolean;
                index: number;
            }) => any;
        } & {
            default?: (props: {
                panel: import(".").AccordionPanel;
                index: number;
            }) => any;
        };
    });
    Avatar: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            image?: string;
            label?: string;
            initials?: string;
            icon?: string;
            shape?: "circle" | "rounded" | "square";
            size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
            background?: string;
            color?: string;
            ring?: boolean;
            ringColor?: string;
            status?: "online" | "busy" | "away" | "offline" | string;
            statusPosition?: "bottom-end" | "bottom-start" | "top-end" | "top-start";
            badge?: string | number;
            badgeSeverity?: "primary" | "success" | "warn" | "danger" | "info" | "secondary" | "contrast";
            badgePosition?: "top-end" | "top-start" | "bottom-end" | "bottom-start";
            badgeBackground?: string;
            badgeColor?: string;
            autoColor?: boolean;
            alt?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            size: "xs" | "sm" | "md" | "lg" | "xl" | number;
            shape: "circle" | "rounded" | "square";
            badgeSeverity: "primary" | "success" | "warn" | "danger" | "info" | "secondary" | "contrast";
            statusPosition: "bottom-end" | "bottom-start" | "top-end" | "top-start";
            badgePosition: "top-end" | "top-start" | "bottom-end" | "bottom-start";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            image?: string;
            label?: string;
            initials?: string;
            icon?: string;
            shape?: "circle" | "rounded" | "square";
            size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
            background?: string;
            color?: string;
            ring?: boolean;
            ringColor?: string;
            status?: "online" | "busy" | "away" | "offline" | string;
            statusPosition?: "bottom-end" | "bottom-start" | "top-end" | "top-start";
            badge?: string | number;
            badgeSeverity?: "primary" | "success" | "warn" | "danger" | "info" | "secondary" | "contrast";
            badgePosition?: "top-end" | "top-start" | "bottom-end" | "bottom-start";
            badgeBackground?: string;
            badgeColor?: string;
            autoColor?: boolean;
            alt?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            size: "xs" | "sm" | "md" | "lg" | "xl" | number;
            shape: "circle" | "rounded" | "square";
            badgeSeverity: "primary" | "success" | "warn" | "danger" | "info" | "secondary" | "contrast";
            statusPosition: "bottom-end" | "bottom-start" | "top-end" | "top-start";
            badgePosition: "top-end" | "top-start" | "bottom-end" | "bottom-start";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        image?: string;
        label?: string;
        initials?: string;
        icon?: string;
        shape?: "circle" | "rounded" | "square";
        size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
        background?: string;
        color?: string;
        ring?: boolean;
        ringColor?: string;
        status?: "online" | "busy" | "away" | "offline" | string;
        statusPosition?: "bottom-end" | "bottom-start" | "top-end" | "top-start";
        badge?: string | number;
        badgeSeverity?: "primary" | "success" | "warn" | "danger" | "info" | "secondary" | "contrast";
        badgePosition?: "top-end" | "top-start" | "bottom-end" | "bottom-start";
        badgeBackground?: string;
        badgeColor?: string;
        autoColor?: boolean;
        alt?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        size: "xs" | "sm" | "md" | "lg" | "xl" | number;
        shape: "circle" | "rounded" | "square";
        badgeSeverity: "primary" | "success" | "warn" | "danger" | "info" | "secondary" | "contrast";
        statusPosition: "bottom-end" | "bottom-start" | "top-end" | "top-start";
        badgePosition: "top-end" | "top-start" | "bottom-end" | "bottom-start";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    AvatarGroup: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            people?: import(".").AvatarPerson[];
            max?: number;
            size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
            shape?: "circle" | "rounded" | "square";
            overlap?: string;
            autoColor?: boolean;
            ring?: boolean;
            ringColor?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            size: "xs" | "sm" | "md" | "lg" | "xl" | number;
            shape: "circle" | "rounded" | "square";
            ring: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            people?: import(".").AvatarPerson[];
            max?: number;
            size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
            shape?: "circle" | "rounded" | "square";
            overlap?: string;
            autoColor?: boolean;
            ring?: boolean;
            ringColor?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            size: "xs" | "sm" | "md" | "lg" | "xl" | number;
            shape: "circle" | "rounded" | "square";
            ring: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        people?: import(".").AvatarPerson[];
        max?: number;
        size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
        shape?: "circle" | "rounded" | "square";
        overlap?: string;
        autoColor?: boolean;
        ring?: boolean;
        ringColor?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        size: "xs" | "sm" | "md" | "lg" | "xl" | number;
        shape: "circle" | "rounded" | "square";
        ring: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    Badge: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            value?: string | number;
            severity?: import(".").BadgeSeverity;
            size?: "sm" | "md" | "lg" | "xl" | number;
            dot?: boolean;
            variant?: "solid" | "outlined" | "subtle";
            background?: string;
            color?: string;
            borderColor?: string;
            radius?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            size: "sm" | "md" | "lg" | "xl" | number;
            variant: "solid" | "outlined" | "subtle";
            severity: import(".").BadgeSeverity;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            value?: string | number;
            severity?: import(".").BadgeSeverity;
            size?: "sm" | "md" | "lg" | "xl" | number;
            dot?: boolean;
            variant?: "solid" | "outlined" | "subtle";
            background?: string;
            color?: string;
            borderColor?: string;
            radius?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            size: "sm" | "md" | "lg" | "xl" | number;
            variant: "solid" | "outlined" | "subtle";
            severity: import(".").BadgeSeverity;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        value?: string | number;
        severity?: import(".").BadgeSeverity;
        size?: "sm" | "md" | "lg" | "xl" | number;
        dot?: boolean;
        variant?: "solid" | "outlined" | "subtle";
        background?: string;
        color?: string;
        borderColor?: string;
        radius?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        size: "sm" | "md" | "lg" | "xl" | number;
        variant: "solid" | "outlined" | "subtle";
        severity: import(".").BadgeSeverity;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    BlockUI: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            blocked?: boolean;
            fullScreen?: boolean;
            duration?: number;
            showTimer?: boolean;
            passthrough?: boolean;
            dismissable?: boolean;
            background?: string;
            opacity?: number;
            blur?: boolean | number | string;
            radius?: string;
            spinner?: boolean;
            icon?: string;
            message?: string;
            contentColor?: string;
            zIndex?: number;
            lockScroll?: boolean;
        }> & Readonly<{
            onBlock?: (() => any) | undefined;
            onTimeout?: (() => any) | undefined;
            "onUpdate:blocked"?: ((v: boolean) => any) | undefined;
            onUnblock?: (() => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:blocked": (v: boolean) => void;
            block: () => void;
            unblock: () => void;
            timeout: () => void;
        }, import("vue").PublicProps, {
            zIndex: number;
            blocked: boolean;
            spinner: boolean;
            lockScroll: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            blocked?: boolean;
            fullScreen?: boolean;
            duration?: number;
            showTimer?: boolean;
            passthrough?: boolean;
            dismissable?: boolean;
            background?: string;
            opacity?: number;
            blur?: boolean | number | string;
            radius?: string;
            spinner?: boolean;
            icon?: string;
            message?: string;
            contentColor?: string;
            zIndex?: number;
            lockScroll?: boolean;
        }> & Readonly<{
            onBlock?: (() => any) | undefined;
            onTimeout?: (() => any) | undefined;
            "onUpdate:blocked"?: ((v: boolean) => any) | undefined;
            onUnblock?: (() => any) | undefined;
        }>, {}, {}, {}, {}, {
            zIndex: number;
            blocked: boolean;
            spinner: boolean;
            lockScroll: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        blocked?: boolean;
        fullScreen?: boolean;
        duration?: number;
        showTimer?: boolean;
        passthrough?: boolean;
        dismissable?: boolean;
        background?: string;
        opacity?: number;
        blur?: boolean | number | string;
        radius?: string;
        spinner?: boolean;
        icon?: string;
        message?: string;
        contentColor?: string;
        zIndex?: number;
        lockScroll?: boolean;
    }> & Readonly<{
        onBlock?: (() => any) | undefined;
        onTimeout?: (() => any) | undefined;
        "onUpdate:blocked"?: ((v: boolean) => any) | undefined;
        onUnblock?: (() => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:blocked": (v: boolean) => void;
        block: () => void;
        unblock: () => void;
        timeout: () => void;
    }, string, {
        zIndex: number;
        blocked: boolean;
        spinner: boolean;
        lockScroll: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        } & {
            content?: (props: {}) => any;
        };
    });
    Chip: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            label?: string;
            icon?: string;
            trailingIcon?: string;
            image?: string;
            imageAlt?: string;
            severity?: import(".").ChipSeverity;
            variant?: "solid" | "subtle" | "outlined";
            size?: "sm" | "md" | "lg";
            radius?: string;
            removable?: boolean;
            removeIcon?: string;
            clickable?: boolean;
            selected?: boolean;
            selectedIcon?: string;
            disabled?: boolean;
            background?: string;
            color?: string;
            borderColor?: string;
            hoverBackground?: string;
            selectedBackground?: string;
            selectedColor?: string;
            width?: string;
            padding?: string;
            gap?: string;
        }> & Readonly<{
            onClick?: ((ev: MouseEvent) => any) | undefined;
            onRemove?: ((ev: KeyboardEvent | MouseEvent) => any) | undefined;
            "onUpdate:selected"?: ((v: boolean) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            click: (ev: MouseEvent) => any;
            remove: (ev: KeyboardEvent | MouseEvent) => any;
            "update:selected": (v: boolean) => any;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            variant: "solid" | "subtle" | "outlined";
            severity: import(".").ChipSeverity;
            removeIcon: string;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            label?: string;
            icon?: string;
            trailingIcon?: string;
            image?: string;
            imageAlt?: string;
            severity?: import(".").ChipSeverity;
            variant?: "solid" | "subtle" | "outlined";
            size?: "sm" | "md" | "lg";
            radius?: string;
            removable?: boolean;
            removeIcon?: string;
            clickable?: boolean;
            selected?: boolean;
            selectedIcon?: string;
            disabled?: boolean;
            background?: string;
            color?: string;
            borderColor?: string;
            hoverBackground?: string;
            selectedBackground?: string;
            selectedColor?: string;
            width?: string;
            padding?: string;
            gap?: string;
        }> & Readonly<{
            onClick?: ((ev: MouseEvent) => any) | undefined;
            onRemove?: ((ev: KeyboardEvent | MouseEvent) => any) | undefined;
            "onUpdate:selected"?: ((v: boolean) => any) | undefined;
        }>, {}, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            variant: "solid" | "subtle" | "outlined";
            severity: import(".").ChipSeverity;
            removeIcon: string;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        label?: string;
        icon?: string;
        trailingIcon?: string;
        image?: string;
        imageAlt?: string;
        severity?: import(".").ChipSeverity;
        variant?: "solid" | "subtle" | "outlined";
        size?: "sm" | "md" | "lg";
        radius?: string;
        removable?: boolean;
        removeIcon?: string;
        clickable?: boolean;
        selected?: boolean;
        selectedIcon?: string;
        disabled?: boolean;
        background?: string;
        color?: string;
        borderColor?: string;
        hoverBackground?: string;
        selectedBackground?: string;
        selectedColor?: string;
        width?: string;
        padding?: string;
        gap?: string;
    }> & Readonly<{
        onClick?: ((ev: MouseEvent) => any) | undefined;
        onRemove?: ((ev: KeyboardEvent | MouseEvent) => any) | undefined;
        "onUpdate:selected"?: ((v: boolean) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        click: (ev: MouseEvent) => any;
        remove: (ev: KeyboardEvent | MouseEvent) => any;
        "update:selected": (v: boolean) => any;
    }, string, {
        size: "sm" | "md" | "lg";
        variant: "solid" | "subtle" | "outlined";
        severity: import(".").ChipSeverity;
        removeIcon: string;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            leading?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        };
    });
    Inplace: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            active?: boolean;
            display?: string;
            displayIcon?: string;
            disabled?: boolean;
            keepAlive?: boolean;
            closable?: boolean;
            closeIcon?: string;
            autoFocus?: boolean;
            width?: string;
            padding?: string;
            radius?: string;
            background?: string;
            color?: string;
            borderColor?: string;
            hoverable?: boolean;
            hoverBackground?: string;
            hoverColor?: string;
            outlined?: boolean;
            contentBackground?: string;
            contentPadding?: string;
        }> & Readonly<{
            onClose?: (() => any) | undefined;
            onOpen?: (() => any) | undefined;
            "onUpdate:active"?: ((v: boolean) => any) | undefined;
        }>, {
            open: () => void;
            close: () => void;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:active": (v: boolean) => void;
            close: () => void;
            open: () => void;
        }, import("vue").PublicProps, {
            active: boolean;
            hoverable: boolean;
            closeIcon: string;
            autoFocus: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            active?: boolean;
            display?: string;
            displayIcon?: string;
            disabled?: boolean;
            keepAlive?: boolean;
            closable?: boolean;
            closeIcon?: string;
            autoFocus?: boolean;
            width?: string;
            padding?: string;
            radius?: string;
            background?: string;
            color?: string;
            borderColor?: string;
            hoverable?: boolean;
            hoverBackground?: string;
            hoverColor?: string;
            outlined?: boolean;
            contentBackground?: string;
            contentPadding?: string;
        }> & Readonly<{
            onClose?: (() => any) | undefined;
            onOpen?: (() => any) | undefined;
            "onUpdate:active"?: ((v: boolean) => any) | undefined;
        }>, {
            open: () => void;
            close: () => void;
        }, {}, {}, {}, {
            active: boolean;
            hoverable: boolean;
            closeIcon: string;
            autoFocus: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        active?: boolean;
        display?: string;
        displayIcon?: string;
        disabled?: boolean;
        keepAlive?: boolean;
        closable?: boolean;
        closeIcon?: string;
        autoFocus?: boolean;
        width?: string;
        padding?: string;
        radius?: string;
        background?: string;
        color?: string;
        borderColor?: string;
        hoverable?: boolean;
        hoverBackground?: string;
        hoverColor?: string;
        outlined?: boolean;
        contentBackground?: string;
        contentPadding?: string;
    }> & Readonly<{
        onClose?: (() => any) | undefined;
        onOpen?: (() => any) | undefined;
        "onUpdate:active"?: ((v: boolean) => any) | undefined;
    }>, {
        open: () => void;
        close: () => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:active": (v: boolean) => void;
        close: () => void;
        open: () => void;
    }, string, {
        active: boolean;
        hoverable: boolean;
        closeIcon: string;
        autoFocus: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            display?: (props: {
                open: () => void;
            }) => any;
        } & {
            content?: (props: {
                close: () => void;
                active: true;
            }) => any;
        };
    });
    MeterGroup: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            value?: import(".").MeterItem[];
            min?: number;
            max?: number;
            orientation?: "horizontal" | "vertical";
            labelPosition?: "start" | "end";
            labelOrientation?: "horizontal" | "vertical";
            showLabels?: boolean;
            showValues?: boolean;
            showMarkers?: boolean;
            size?: string;
            length?: string;
            radius?: string;
            segmentRadius?: string;
            gap?: string;
            trackBackground?: string;
            labelColor?: string;
            labelSize?: string;
            hoverable?: boolean;
            animated?: boolean;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MeterItem;
                index: number;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "item-click": (payload: {
                item: import(".").MeterItem;
                index: number;
            }) => any;
        }, import("vue").PublicProps, {
            min: number;
            max: number;
            orientation: "horizontal" | "vertical";
            labelPosition: "start" | "end";
            labelOrientation: "horizontal" | "vertical";
            showLabels: boolean;
            showValues: boolean;
            showMarkers: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            value?: import(".").MeterItem[];
            min?: number;
            max?: number;
            orientation?: "horizontal" | "vertical";
            labelPosition?: "start" | "end";
            labelOrientation?: "horizontal" | "vertical";
            showLabels?: boolean;
            showValues?: boolean;
            showMarkers?: boolean;
            size?: string;
            length?: string;
            radius?: string;
            segmentRadius?: string;
            gap?: string;
            trackBackground?: string;
            labelColor?: string;
            labelSize?: string;
            hoverable?: boolean;
            animated?: boolean;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MeterItem;
                index: number;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, {
            min: number;
            max: number;
            orientation: "horizontal" | "vertical";
            labelPosition: "start" | "end";
            labelOrientation: "horizontal" | "vertical";
            showLabels: boolean;
            showValues: boolean;
            showMarkers: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        value?: import(".").MeterItem[];
        min?: number;
        max?: number;
        orientation?: "horizontal" | "vertical";
        labelPosition?: "start" | "end";
        labelOrientation?: "horizontal" | "vertical";
        showLabels?: boolean;
        showValues?: boolean;
        showMarkers?: boolean;
        size?: string;
        length?: string;
        radius?: string;
        segmentRadius?: string;
        gap?: string;
        trackBackground?: string;
        labelColor?: string;
        labelSize?: string;
        hoverable?: boolean;
        animated?: boolean;
    }> & Readonly<{
        "onItem-click"?: ((payload: {
            item: import(".").MeterItem;
            index: number;
        }) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "item-click": (payload: {
            item: import(".").MeterItem;
            index: number;
        }) => any;
    }, string, {
        min: number;
        max: number;
        orientation: "horizontal" | "vertical";
        labelPosition: "start" | "end";
        labelOrientation: "horizontal" | "vertical";
        showLabels: boolean;
        showValues: boolean;
        showMarkers: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            start?: (props: {
                total: number;
            }) => unknown;
            end?: (props: {
                total: number;
            }) => unknown;
            label?: (props: {
                items: import(".").MeterItem[];
                total: number;
            }) => unknown;
            meter?: (props: {
                item: import(".").MeterItem;
                index: number;
                percent: number;
                color: string;
            }) => unknown;
        };
    });
    OverlayBadge: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            value?: string | number;
            severity?: import(".").BadgeSeverity;
            size?: "sm" | "md" | "lg" | "xl" | number;
            dot?: boolean;
            variant?: "solid" | "outlined" | "subtle";
            position?: "top-end" | "top-start" | "bottom-end" | "bottom-start";
            background?: string;
            color?: string;
            borderColor?: string;
            radius?: string;
            ring?: boolean;
            ringColor?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            size: "sm" | "md" | "lg" | "xl" | number;
            position: "top-end" | "top-start" | "bottom-end" | "bottom-start";
            variant: "solid" | "outlined" | "subtle";
            severity: import(".").BadgeSeverity;
            ring: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            value?: string | number;
            severity?: import(".").BadgeSeverity;
            size?: "sm" | "md" | "lg" | "xl" | number;
            dot?: boolean;
            variant?: "solid" | "outlined" | "subtle";
            position?: "top-end" | "top-start" | "bottom-end" | "bottom-start";
            background?: string;
            color?: string;
            borderColor?: string;
            radius?: string;
            ring?: boolean;
            ringColor?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            size: "sm" | "md" | "lg" | "xl" | number;
            position: "top-end" | "top-start" | "bottom-end" | "bottom-start";
            variant: "solid" | "outlined" | "subtle";
            severity: import(".").BadgeSeverity;
            ring: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        value?: string | number;
        severity?: import(".").BadgeSeverity;
        size?: "sm" | "md" | "lg" | "xl" | number;
        dot?: boolean;
        variant?: "solid" | "outlined" | "subtle";
        position?: "top-end" | "top-start" | "bottom-end" | "bottom-start";
        background?: string;
        color?: string;
        borderColor?: string;
        radius?: string;
        ring?: boolean;
        ringColor?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        size: "sm" | "md" | "lg" | "xl" | number;
        position: "top-end" | "top-start" | "bottom-end" | "bottom-start";
        variant: "solid" | "outlined" | "subtle";
        severity: import(".").BadgeSeverity;
        ring: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        } & {
            badge?: (props: {}) => any;
        };
    });
    Card: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexContainerProps & {
            title?: string;
            subtitle?: string;
            image?: string;
            imageAlt?: string;
            imageHeight?: string;
            bordered?: boolean;
            shadow?: "none" | "sm" | "md" | "lg";
            radius?: string;
            padding?: string;
            background?: string;
            borderColor?: string;
            hoverable?: boolean;
            clickable?: boolean;
            href?: string;
            horizontal?: boolean;
        }> & Readonly<{
            onClick?: ((ev: MouseEvent) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            click: (ev: MouseEvent) => any;
        }, import("vue").PublicProps, {
            bordered: boolean;
            shadow: "none" | "sm" | "md" | "lg";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexContainerProps & {
            title?: string;
            subtitle?: string;
            image?: string;
            imageAlt?: string;
            imageHeight?: string;
            bordered?: boolean;
            shadow?: "none" | "sm" | "md" | "lg";
            radius?: string;
            padding?: string;
            background?: string;
            borderColor?: string;
            hoverable?: boolean;
            clickable?: boolean;
            href?: string;
            horizontal?: boolean;
        }> & Readonly<{
            onClick?: ((ev: MouseEvent) => any) | undefined;
        }>, {}, {}, {}, {}, {
            bordered: boolean;
            shadow: "none" | "sm" | "md" | "lg";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexContainerProps & {
        title?: string;
        subtitle?: string;
        image?: string;
        imageAlt?: string;
        imageHeight?: string;
        bordered?: boolean;
        shadow?: "none" | "sm" | "md" | "lg";
        radius?: string;
        padding?: string;
        background?: string;
        borderColor?: string;
        hoverable?: boolean;
        clickable?: boolean;
        href?: string;
        horizontal?: boolean;
    }> & Readonly<{
        onClick?: ((ev: MouseEvent) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        click: (ev: MouseEvent) => any;
    }, string, {
        bordered: boolean;
        shadow: "none" | "sm" | "md" | "lg";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            media?: (props: {}) => any;
        } & {
            header?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        } & {
            footer?: (props: {}) => any;
        };
    });
    Fieldset: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexContainerProps & {
            legend?: string;
            icon?: string;
            toggleable?: boolean;
            collapsed?: boolean;
            expandIcon?: string;
            collapseIcon?: string;
            legendAlign?: "start" | "center" | "end";
            size?: "sm" | "md" | "lg";
            bordered?: boolean;
            radius?: string;
            padding?: string;
            background?: string;
            borderColor?: string;
            legendBackground?: string;
            legendColor?: string;
            disabled?: boolean;
        }> & Readonly<{
            onToggle?: ((payload: {
                collapsed: boolean;
            }) => any) | undefined;
            "onUpdate:collapsed"?: ((v: boolean) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            toggle: (payload: {
                collapsed: boolean;
            }) => any;
            "update:collapsed": (v: boolean) => any;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            bordered: boolean;
            expandIcon: string;
            collapseIcon: string;
            toggleable: boolean;
            collapsed: boolean;
            legendAlign: "start" | "center" | "end";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexContainerProps & {
            legend?: string;
            icon?: string;
            toggleable?: boolean;
            collapsed?: boolean;
            expandIcon?: string;
            collapseIcon?: string;
            legendAlign?: "start" | "center" | "end";
            size?: "sm" | "md" | "lg";
            bordered?: boolean;
            radius?: string;
            padding?: string;
            background?: string;
            borderColor?: string;
            legendBackground?: string;
            legendColor?: string;
            disabled?: boolean;
        }> & Readonly<{
            onToggle?: ((payload: {
                collapsed: boolean;
            }) => any) | undefined;
            "onUpdate:collapsed"?: ((v: boolean) => any) | undefined;
        }>, {}, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            bordered: boolean;
            expandIcon: string;
            collapseIcon: string;
            toggleable: boolean;
            collapsed: boolean;
            legendAlign: "start" | "center" | "end";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexContainerProps & {
        legend?: string;
        icon?: string;
        toggleable?: boolean;
        collapsed?: boolean;
        expandIcon?: string;
        collapseIcon?: string;
        legendAlign?: "start" | "center" | "end";
        size?: "sm" | "md" | "lg";
        bordered?: boolean;
        radius?: string;
        padding?: string;
        background?: string;
        borderColor?: string;
        legendBackground?: string;
        legendColor?: string;
        disabled?: boolean;
    }> & Readonly<{
        onToggle?: ((payload: {
            collapsed: boolean;
        }) => any) | undefined;
        "onUpdate:collapsed"?: ((v: boolean) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        toggle: (payload: {
            collapsed: boolean;
        }) => any;
        "update:collapsed": (v: boolean) => any;
    }, string, {
        size: "sm" | "md" | "lg";
        bordered: boolean;
        expandIcon: string;
        collapseIcon: string;
        toggleable: boolean;
        collapsed: boolean;
        legendAlign: "start" | "center" | "end";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            toggleicon?: (props: {
                collapsed: boolean;
            }) => any;
        } & {
            legend?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        };
    });
    Panel: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexContainerProps & {
            header?: string;
            subheader?: string;
            icon?: string;
            toggleable?: boolean;
            collapsed?: boolean;
            expandIcon?: string;
            collapseIcon?: string;
            togglePosition?: "start" | "end";
            size?: "sm" | "md" | "lg";
            bordered?: boolean;
            shadow?: "none" | "sm" | "md";
            radius?: string;
            padding?: string;
            background?: string;
            borderColor?: string;
            headerBackground?: string;
            headerColor?: string;
            flush?: boolean;
        }> & Readonly<{
            onToggle?: ((payload: {
                collapsed: boolean;
            }) => any) | undefined;
            "onUpdate:collapsed"?: ((v: boolean) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            toggle: (payload: {
                collapsed: boolean;
            }) => any;
            "update:collapsed": (v: boolean) => any;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            bordered: boolean;
            expandIcon: string;
            collapseIcon: string;
            toggleable: boolean;
            collapsed: boolean;
            togglePosition: "start" | "end";
            shadow: "none" | "sm" | "md";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexContainerProps & {
            header?: string;
            subheader?: string;
            icon?: string;
            toggleable?: boolean;
            collapsed?: boolean;
            expandIcon?: string;
            collapseIcon?: string;
            togglePosition?: "start" | "end";
            size?: "sm" | "md" | "lg";
            bordered?: boolean;
            shadow?: "none" | "sm" | "md";
            radius?: string;
            padding?: string;
            background?: string;
            borderColor?: string;
            headerBackground?: string;
            headerColor?: string;
            flush?: boolean;
        }> & Readonly<{
            onToggle?: ((payload: {
                collapsed: boolean;
            }) => any) | undefined;
            "onUpdate:collapsed"?: ((v: boolean) => any) | undefined;
        }>, {}, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            bordered: boolean;
            expandIcon: string;
            collapseIcon: string;
            toggleable: boolean;
            collapsed: boolean;
            togglePosition: "start" | "end";
            shadow: "none" | "sm" | "md";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexContainerProps & {
        header?: string;
        subheader?: string;
        icon?: string;
        toggleable?: boolean;
        collapsed?: boolean;
        expandIcon?: string;
        collapseIcon?: string;
        togglePosition?: "start" | "end";
        size?: "sm" | "md" | "lg";
        bordered?: boolean;
        shadow?: "none" | "sm" | "md";
        radius?: string;
        padding?: string;
        background?: string;
        borderColor?: string;
        headerBackground?: string;
        headerColor?: string;
        flush?: boolean;
    }> & Readonly<{
        onToggle?: ((payload: {
            collapsed: boolean;
        }) => any) | undefined;
        "onUpdate:collapsed"?: ((v: boolean) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        toggle: (payload: {
            collapsed: boolean;
        }) => any;
        "update:collapsed": (v: boolean) => any;
    }, string, {
        size: "sm" | "md" | "lg";
        bordered: boolean;
        expandIcon: string;
        collapseIcon: string;
        toggleable: boolean;
        collapsed: boolean;
        togglePosition: "start" | "end";
        shadow: "none" | "sm" | "md";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            toggleicon?: (props: {
                collapsed: boolean;
            }) => any;
        } & {
            header?: (props: {}) => any;
        } & {
            icons?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        } & {
            footer?: (props: {}) => any;
        };
    });
    ScrollArea: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexContainerProps & {
            height?: string;
            maxHeight?: string;
            width?: string;
            variant?: "auto" | "hover" | "scroll" | "always" | "hidden";
            mask?: boolean;
            scrollbarSize?: number;
            thumbColor?: string;
            thumbHoverColor?: string;
            trackColor?: string;
            thumbRadius?: string;
            padding?: string;
        }> & Readonly<{
            onScroll?: ((payload: {
                top: number;
                left: number;
            }) => any) | undefined;
        }>, {
            viewport: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
            measure: () => void;
            scrollTo: (o: ScrollToOptions) => void | undefined;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            scroll: (payload: {
                top: number;
                left: number;
            }) => any;
        }, import("vue").PublicProps, {
            variant: "auto" | "hover" | "scroll" | "always" | "hidden";
            scrollbarSize: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexContainerProps & {
            height?: string;
            maxHeight?: string;
            width?: string;
            variant?: "auto" | "hover" | "scroll" | "always" | "hidden";
            mask?: boolean;
            scrollbarSize?: number;
            thumbColor?: string;
            thumbHoverColor?: string;
            trackColor?: string;
            thumbRadius?: string;
            padding?: string;
        }> & Readonly<{
            onScroll?: ((payload: {
                top: number;
                left: number;
            }) => any) | undefined;
        }>, {
            viewport: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
            measure: () => void;
            scrollTo: (o: ScrollToOptions) => void | undefined;
        }, {}, {}, {}, {
            variant: "auto" | "hover" | "scroll" | "always" | "hidden";
            scrollbarSize: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexContainerProps & {
        height?: string;
        maxHeight?: string;
        width?: string;
        variant?: "auto" | "hover" | "scroll" | "always" | "hidden";
        mask?: boolean;
        scrollbarSize?: number;
        thumbColor?: string;
        thumbHoverColor?: string;
        trackColor?: string;
        thumbRadius?: string;
        padding?: string;
    }> & Readonly<{
        onScroll?: ((payload: {
            top: number;
            left: number;
        }) => any) | undefined;
    }>, {
        viewport: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
        measure: () => void;
        scrollTo: (o: ScrollToOptions) => void | undefined;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        scroll: (payload: {
            top: number;
            left: number;
        }) => any;
    }, string, {
        variant: "auto" | "hover" | "scroll" | "always" | "hidden";
        scrollbarSize: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    Splitter: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexContainerProps & {
            panels?: import(".").SplitterPanel[];
            sizes?: number[];
            layout?: "horizontal" | "vertical";
            step?: number;
            gutterSize?: number;
            disabled?: boolean;
            stateKey?: string;
            stateStorage?: "local" | "session";
            height?: string;
            bordered?: boolean;
            radius?: string;
            borderColor?: string;
            gutterColor?: string;
            gutterHoverColor?: string;
            showHandle?: boolean;
        }> & Readonly<{
            onResize?: ((payload: {
                sizes: number[];
                index: number;
            }) => any) | undefined;
            onCollapse?: ((payload: {
                index: number;
                collapsed: boolean;
                sizes: number[];
            }) => any) | undefined;
            "onUpdate:sizes"?: ((v: number[]) => any) | undefined;
            onResizestart?: ((payload: {
                sizes: number[];
                index: number;
            }) => any) | undefined;
            onResizeend?: ((payload: {
                sizes: number[];
                index: number;
            }) => any) | undefined;
        }>, {
            sizes: import("vue").ComputedRef<number[]>;
            reset: () => void;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:sizes": (v: number[]) => void;
            resize: (payload: {
                sizes: number[];
                index: number;
            }) => void;
            resizestart: (payload: {
                sizes: number[];
                index: number;
            }) => void;
            resizeend: (payload: {
                sizes: number[];
                index: number;
            }) => void;
            collapse: (payload: {
                index: number;
                collapsed: boolean;
                sizes: number[];
            }) => void;
        }, import("vue").PublicProps, {
            step: number;
            bordered: boolean;
            stateStorage: "local" | "session";
            layout: "horizontal" | "vertical";
            gutterSize: number;
            showHandle: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexContainerProps & {
            panels?: import(".").SplitterPanel[];
            sizes?: number[];
            layout?: "horizontal" | "vertical";
            step?: number;
            gutterSize?: number;
            disabled?: boolean;
            stateKey?: string;
            stateStorage?: "local" | "session";
            height?: string;
            bordered?: boolean;
            radius?: string;
            borderColor?: string;
            gutterColor?: string;
            gutterHoverColor?: string;
            showHandle?: boolean;
        }> & Readonly<{
            onResize?: ((payload: {
                sizes: number[];
                index: number;
            }) => any) | undefined;
            onCollapse?: ((payload: {
                index: number;
                collapsed: boolean;
                sizes: number[];
            }) => any) | undefined;
            "onUpdate:sizes"?: ((v: number[]) => any) | undefined;
            onResizestart?: ((payload: {
                sizes: number[];
                index: number;
            }) => any) | undefined;
            onResizeend?: ((payload: {
                sizes: number[];
                index: number;
            }) => any) | undefined;
        }>, {
            sizes: import("vue").ComputedRef<number[]>;
            reset: () => void;
        }, {}, {}, {}, {
            step: number;
            bordered: boolean;
            stateStorage: "local" | "session";
            layout: "horizontal" | "vertical";
            gutterSize: number;
            showHandle: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexContainerProps & {
        panels?: import(".").SplitterPanel[];
        sizes?: number[];
        layout?: "horizontal" | "vertical";
        step?: number;
        gutterSize?: number;
        disabled?: boolean;
        stateKey?: string;
        stateStorage?: "local" | "session";
        height?: string;
        bordered?: boolean;
        radius?: string;
        borderColor?: string;
        gutterColor?: string;
        gutterHoverColor?: string;
        showHandle?: boolean;
    }> & Readonly<{
        onResize?: ((payload: {
            sizes: number[];
            index: number;
        }) => any) | undefined;
        onCollapse?: ((payload: {
            index: number;
            collapsed: boolean;
            sizes: number[];
        }) => any) | undefined;
        "onUpdate:sizes"?: ((v: number[]) => any) | undefined;
        onResizestart?: ((payload: {
            sizes: number[];
            index: number;
        }) => any) | undefined;
        onResizeend?: ((payload: {
            sizes: number[];
            index: number;
        }) => any) | undefined;
    }>, {
        sizes: import("vue").ComputedRef<number[]>;
        reset: () => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:sizes": (v: number[]) => void;
        resize: (payload: {
            sizes: number[];
            index: number;
        }) => void;
        resizestart: (payload: {
            sizes: number[];
            index: number;
        }) => void;
        resizeend: (payload: {
            sizes: number[];
            index: number;
        }) => void;
        collapse: (payload: {
            index: number;
            collapsed: boolean;
            sizes: number[];
        }) => void;
    }, string, {
        step: number;
        bordered: boolean;
        stateStorage: "local" | "session";
        layout: "horizontal" | "vertical";
        gutterSize: number;
        showHandle: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            [x: `panel-${number}`]: ((props: {
                size: number;
                index: number;
            }) => any) | undefined;
        } & {
            default?: (props: {
                size: number;
                index: number;
            }) => any;
        } & {
            gutter?: (props: {
                index: number;
            }) => any;
        };
    });
    Steps: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexContainerProps & {
            steps?: import(".").StepsStep[];
            modelValue?: string | number;
            orientation?: "horizontal" | "vertical";
            linear?: boolean;
            stepsOnly?: boolean;
            as?: "button" | "div";
            showComplete?: boolean;
            completeIcon?: string;
            showNav?: boolean;
            backLabel?: string;
            nextLabel?: string;
            finishLabel?: string;
            size?: "sm" | "md" | "lg";
            activeColor?: string;
            completeColor?: string;
            connectorColor?: string;
            markerSize?: number;
            hideConnector?: boolean;
            disabled?: boolean;
        }> & Readonly<{
            "onUpdate:modelValue"?: ((v: string | number) => any) | undefined;
            "onStep-change"?: ((payload: {
                value: string | number;
                index: number;
                previous: string | number;
            }) => any) | undefined;
            onFinish?: ((payload: {
                value: string | number;
                index: number;
            }) => any) | undefined;
        }>, {
            goTo: (i: number) => void;
            back: () => void;
            next: () => void;
            activeIndex: import("vue").ComputedRef<number>;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "update:modelValue": (v: string | number) => any;
            "step-change": (payload: {
                value: string | number;
                index: number;
                previous: string | number;
            }) => any;
            finish: (payload: {
                value: string | number;
                index: number;
            }) => any;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            orientation: "horizontal" | "vertical";
            as: "button" | "div";
            showComplete: boolean;
            completeIcon: string;
            backLabel: string;
            nextLabel: string;
            finishLabel: string;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexContainerProps & {
            steps?: import(".").StepsStep[];
            modelValue?: string | number;
            orientation?: "horizontal" | "vertical";
            linear?: boolean;
            stepsOnly?: boolean;
            as?: "button" | "div";
            showComplete?: boolean;
            completeIcon?: string;
            showNav?: boolean;
            backLabel?: string;
            nextLabel?: string;
            finishLabel?: string;
            size?: "sm" | "md" | "lg";
            activeColor?: string;
            completeColor?: string;
            connectorColor?: string;
            markerSize?: number;
            hideConnector?: boolean;
            disabled?: boolean;
        }> & Readonly<{
            "onUpdate:modelValue"?: ((v: string | number) => any) | undefined;
            "onStep-change"?: ((payload: {
                value: string | number;
                index: number;
                previous: string | number;
            }) => any) | undefined;
            onFinish?: ((payload: {
                value: string | number;
                index: number;
            }) => any) | undefined;
        }>, {
            goTo: (i: number) => void;
            back: () => void;
            next: () => void;
            activeIndex: import("vue").ComputedRef<number>;
        }, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            orientation: "horizontal" | "vertical";
            as: "button" | "div";
            showComplete: boolean;
            completeIcon: string;
            backLabel: string;
            nextLabel: string;
            finishLabel: string;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexContainerProps & {
        steps?: import(".").StepsStep[];
        modelValue?: string | number;
        orientation?: "horizontal" | "vertical";
        linear?: boolean;
        stepsOnly?: boolean;
        as?: "button" | "div";
        showComplete?: boolean;
        completeIcon?: string;
        showNav?: boolean;
        backLabel?: string;
        nextLabel?: string;
        finishLabel?: string;
        size?: "sm" | "md" | "lg";
        activeColor?: string;
        completeColor?: string;
        connectorColor?: string;
        markerSize?: number;
        hideConnector?: boolean;
        disabled?: boolean;
    }> & Readonly<{
        "onUpdate:modelValue"?: ((v: string | number) => any) | undefined;
        "onStep-change"?: ((payload: {
            value: string | number;
            index: number;
            previous: string | number;
        }) => any) | undefined;
        onFinish?: ((payload: {
            value: string | number;
            index: number;
        }) => any) | undefined;
    }>, {
        goTo: (i: number) => void;
        back: () => void;
        next: () => void;
        activeIndex: import("vue").ComputedRef<number>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "update:modelValue": (v: string | number) => any;
        "step-change": (payload: {
            value: string | number;
            index: number;
            previous: string | number;
        }) => any;
        finish: (payload: {
            value: string | number;
            index: number;
        }) => any;
    }, string, {
        size: "sm" | "md" | "lg";
        orientation: "horizontal" | "vertical";
        as: "button" | "div";
        showComplete: boolean;
        completeIcon: string;
        backLabel: string;
        nextLabel: string;
        finishLabel: string;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            [x: `step-${number}`]: ((props: {
                step: import(".").StepsStep;
                index: number;
                active: boolean;
                complete: boolean;
                goTo: () => void;
            }) => any) | undefined;
        } & {
            [x: `panel-${number}`]: ((props: {
                step: import(".").StepsStep;
                index: number;
                back: () => void;
                next: () => void;
            }) => any) | undefined;
        } & {
            [x: `step-${number}`]: ((props: {
                step: import(".").StepsStep;
                index: number;
                active: boolean;
                complete: boolean;
                goTo: () => void;
            }) => any) | undefined;
        } & {
            [x: `panel-${number}`]: ((props: {
                step: import(".").StepsStep;
                index: number;
                back: () => void;
                next: () => void;
            }) => any) | undefined;
        };
    });
    Tabs: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexContainerProps & {
            tabs?: import(".").TabItem[];
            modelValue?: string | number;
            placement?: "top" | "bottom" | "left" | "right";
            selectOnFocus?: boolean;
            lazy?: boolean;
            unmountInactive?: boolean;
            tabsOnly?: boolean;
            size?: "sm" | "md" | "lg";
            variant?: "underline" | "pill" | "enclosed";
            fill?: boolean;
            align?: "start" | "center" | "end";
            activeColor?: string;
            indicatorColor?: string;
            tabColor?: string;
            stripBackground?: string;
            borderColor?: string;
            radius?: string;
            padding?: string;
            bordered?: boolean;
            stripWidth?: string;
            disabled?: boolean;
        }> & Readonly<{
            "onUpdate:modelValue"?: ((v: string | number) => any) | undefined;
            "onTab-change"?: ((payload: {
                value: string | number;
                index: number;
                previous: string | number;
            }) => any) | undefined;
        }>, {
            select: (i: number) => void;
            measure: () => void;
            activeIndex: import("vue").ComputedRef<number>;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "update:modelValue": (v: string | number) => any;
            "tab-change": (payload: {
                value: string | number;
                index: number;
                previous: string | number;
            }) => any;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            align: "start" | "center" | "end";
            variant: "underline" | "pill" | "enclosed";
            bordered: boolean;
            placement: "top" | "bottom" | "left" | "right";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexContainerProps & {
            tabs?: import(".").TabItem[];
            modelValue?: string | number;
            placement?: "top" | "bottom" | "left" | "right";
            selectOnFocus?: boolean;
            lazy?: boolean;
            unmountInactive?: boolean;
            tabsOnly?: boolean;
            size?: "sm" | "md" | "lg";
            variant?: "underline" | "pill" | "enclosed";
            fill?: boolean;
            align?: "start" | "center" | "end";
            activeColor?: string;
            indicatorColor?: string;
            tabColor?: string;
            stripBackground?: string;
            borderColor?: string;
            radius?: string;
            padding?: string;
            bordered?: boolean;
            stripWidth?: string;
            disabled?: boolean;
        }> & Readonly<{
            "onUpdate:modelValue"?: ((v: string | number) => any) | undefined;
            "onTab-change"?: ((payload: {
                value: string | number;
                index: number;
                previous: string | number;
            }) => any) | undefined;
        }>, {
            select: (i: number) => void;
            measure: () => void;
            activeIndex: import("vue").ComputedRef<number>;
        }, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            align: "start" | "center" | "end";
            variant: "underline" | "pill" | "enclosed";
            bordered: boolean;
            placement: "top" | "bottom" | "left" | "right";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexContainerProps & {
        tabs?: import(".").TabItem[];
        modelValue?: string | number;
        placement?: "top" | "bottom" | "left" | "right";
        selectOnFocus?: boolean;
        lazy?: boolean;
        unmountInactive?: boolean;
        tabsOnly?: boolean;
        size?: "sm" | "md" | "lg";
        variant?: "underline" | "pill" | "enclosed";
        fill?: boolean;
        align?: "start" | "center" | "end";
        activeColor?: string;
        indicatorColor?: string;
        tabColor?: string;
        stripBackground?: string;
        borderColor?: string;
        radius?: string;
        padding?: string;
        bordered?: boolean;
        stripWidth?: string;
        disabled?: boolean;
    }> & Readonly<{
        "onUpdate:modelValue"?: ((v: string | number) => any) | undefined;
        "onTab-change"?: ((payload: {
            value: string | number;
            index: number;
            previous: string | number;
        }) => any) | undefined;
    }>, {
        select: (i: number) => void;
        measure: () => void;
        activeIndex: import("vue").ComputedRef<number>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "update:modelValue": (v: string | number) => any;
        "tab-change": (payload: {
            value: string | number;
            index: number;
            previous: string | number;
        }) => any;
    }, string, {
        size: "sm" | "md" | "lg";
        align: "start" | "center" | "end";
        variant: "underline" | "pill" | "enclosed";
        bordered: boolean;
        placement: "top" | "bottom" | "left" | "right";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            [x: `tab-${number}`]: ((props: {
                tab: import(".").TabItem;
                index: number;
                active: boolean;
            }) => any) | undefined;
        } & {
            [x: `panel-${number}`]: ((props: {
                tab: import(".").TabItem;
                index: number;
                active: boolean;
            }) => any) | undefined;
        };
    });
    Toolbar: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexContainerProps & {
            size?: "sm" | "md" | "lg";
            gap?: string;
            wrap?: boolean;
            background?: string;
            borderColor?: string;
            color?: string;
            radius?: string;
            padding?: string;
            bordered?: boolean;
            raised?: boolean;
            sticky?: boolean;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            bordered: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexContainerProps & {
            size?: "sm" | "md" | "lg";
            gap?: string;
            wrap?: boolean;
            background?: string;
            borderColor?: string;
            color?: string;
            radius?: string;
            padding?: string;
            bordered?: boolean;
            raised?: boolean;
            sticky?: boolean;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            bordered: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexContainerProps & {
        size?: "sm" | "md" | "lg";
        gap?: string;
        wrap?: boolean;
        background?: string;
        borderColor?: string;
        color?: string;
        radius?: string;
        padding?: string;
        bordered?: boolean;
        raised?: boolean;
        sticky?: boolean;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        size: "sm" | "md" | "lg";
        bordered: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            start?: (props: {}) => any;
        } & {
            center?: (props: {}) => any;
        } & {
            end?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        };
    });
    Dialog: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexOverlayTransition & {
            visible?: boolean;
            header?: string;
            subtitle?: string;
            icon?: string;
            position?: import(".").DialogPosition;
            modal?: boolean;
            draggable?: boolean;
            closable?: boolean;
            closeOnEscape?: boolean;
            dismissableMask?: boolean;
            autoClose?: number;
            showTimer?: boolean;
            width?: string;
            maxWidth?: string;
            padding?: string;
            background?: string;
            radius?: string;
            borderColor?: string;
            maskColor?: string;
            maskBlur?: boolean;
            zIndex?: number;
            contentClass?: string;
        }> & Readonly<{
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
            "onUpdate:visible"?: ((v: boolean) => any) | undefined;
            "onAfter-hide"?: (() => any) | undefined;
        }>, {
            close: () => void;
            panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:visible": (v: boolean) => void;
            show: () => void;
            hide: () => void;
            "after-hide": () => void;
        }, import("vue").PublicProps, {
            transition: import("./types").OverlayTransitionName;
            position: import(".").DialogPosition;
            zIndex: number;
            modal: boolean;
            closable: boolean;
            closeOnEscape: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexOverlayTransition & {
            visible?: boolean;
            header?: string;
            subtitle?: string;
            icon?: string;
            position?: import(".").DialogPosition;
            modal?: boolean;
            draggable?: boolean;
            closable?: boolean;
            closeOnEscape?: boolean;
            dismissableMask?: boolean;
            autoClose?: number;
            showTimer?: boolean;
            width?: string;
            maxWidth?: string;
            padding?: string;
            background?: string;
            radius?: string;
            borderColor?: string;
            maskColor?: string;
            maskBlur?: boolean;
            zIndex?: number;
            contentClass?: string;
        }> & Readonly<{
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
            "onUpdate:visible"?: ((v: boolean) => any) | undefined;
            "onAfter-hide"?: (() => any) | undefined;
        }>, {
            close: () => void;
            panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
        }, {}, {}, {}, {
            transition: import("./types").OverlayTransitionName;
            position: import(".").DialogPosition;
            zIndex: number;
            modal: boolean;
            closable: boolean;
            closeOnEscape: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexOverlayTransition & {
        visible?: boolean;
        header?: string;
        subtitle?: string;
        icon?: string;
        position?: import(".").DialogPosition;
        modal?: boolean;
        draggable?: boolean;
        closable?: boolean;
        closeOnEscape?: boolean;
        dismissableMask?: boolean;
        autoClose?: number;
        showTimer?: boolean;
        width?: string;
        maxWidth?: string;
        padding?: string;
        background?: string;
        radius?: string;
        borderColor?: string;
        maskColor?: string;
        maskBlur?: boolean;
        zIndex?: number;
        contentClass?: string;
    }> & Readonly<{
        onShow?: (() => any) | undefined;
        onHide?: (() => any) | undefined;
        "onUpdate:visible"?: ((v: boolean) => any) | undefined;
        "onAfter-hide"?: (() => any) | undefined;
    }>, {
        close: () => void;
        panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:visible": (v: boolean) => void;
        show: () => void;
        hide: () => void;
        "after-hide": () => void;
    }, string, {
        transition: import("./types").OverlayTransitionName;
        position: import(".").DialogPosition;
        zIndex: number;
        modal: boolean;
        closable: boolean;
        closeOnEscape: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            header?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        } & {
            footer?: (props: {}) => any;
        };
    });
    Alert: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexOverlayTransition & {
            group?: string;
            header?: string;
            message?: string;
            icon?: string;
            iconPosition?: "top" | "left" | "right" | "bottom";
            iconAnimation?: "none" | "pulse" | "shake" | "bounce";
            iconColor?: string;
            acceptLabel?: string;
            rejectLabel?: string;
            width?: string;
            ripple?: boolean;
            ui?: import("./types").ApexAlertClasses;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            ripple: boolean;
            iconPosition: "top" | "left" | "right" | "bottom";
            iconAnimation: "none" | "pulse" | "shake" | "bounce";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexOverlayTransition & {
            group?: string;
            header?: string;
            message?: string;
            icon?: string;
            iconPosition?: "top" | "left" | "right" | "bottom";
            iconAnimation?: "none" | "pulse" | "shake" | "bounce";
            iconColor?: string;
            acceptLabel?: string;
            rejectLabel?: string;
            width?: string;
            ripple?: boolean;
            ui?: import("./types").ApexAlertClasses;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            ripple: boolean;
            iconPosition: "top" | "left" | "right" | "bottom";
            iconAnimation: "none" | "pulse" | "shake" | "bounce";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexOverlayTransition & {
        group?: string;
        header?: string;
        message?: string;
        icon?: string;
        iconPosition?: "top" | "left" | "right" | "bottom";
        iconAnimation?: "none" | "pulse" | "shake" | "bounce";
        iconColor?: string;
        acceptLabel?: string;
        rejectLabel?: string;
        width?: string;
        ripple?: boolean;
        ui?: import("./types").ApexAlertClasses;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        ripple: boolean;
        iconPosition: "top" | "left" | "right" | "bottom";
        iconAnimation: "none" | "pulse" | "shake" | "bounce";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            container?: (props: {
                state: import("./core/alert").AlertState;
                buttons: import(".").AlertButton[];
                press: (b: import(".").AlertButton, index?: number) => Promise<void>;
                close: () => void;
            }) => any;
        } & {
            icon?: (props: {
                state: import("./core/alert").AlertState;
            }) => any;
        } & {
            message?: (props: {
                state: import("./core/alert").AlertState;
            }) => any;
        } & {
            footer?: (props: {
                buttons: import(".").AlertButton[];
                press: (b: import(".").AlertButton, index?: number) => Promise<void>;
            }) => any;
        };
    });
    ConfirmPopup: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexOverlayClasses & {
            group?: string;
            message?: string;
            icon?: string;
            iconColor?: string;
            acceptLabel?: string;
            rejectLabel?: string;
            side?: import(".").AnchorSide;
            align?: "start" | "center" | "end";
            gap?: number;
            showArrow?: boolean;
            width?: string;
            zIndex?: number;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            side: import(".").AnchorSide;
            zIndex: number;
            align: "start" | "center" | "end";
            gap: number;
            acceptLabel: string;
            rejectLabel: string;
            showArrow: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexOverlayClasses & {
            group?: string;
            message?: string;
            icon?: string;
            iconColor?: string;
            acceptLabel?: string;
            rejectLabel?: string;
            side?: import(".").AnchorSide;
            align?: "start" | "center" | "end";
            gap?: number;
            showArrow?: boolean;
            width?: string;
            zIndex?: number;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            side: import(".").AnchorSide;
            zIndex: number;
            align: "start" | "center" | "end";
            gap: number;
            acceptLabel: string;
            rejectLabel: string;
            showArrow: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexOverlayClasses & {
        group?: string;
        message?: string;
        icon?: string;
        iconColor?: string;
        acceptLabel?: string;
        rejectLabel?: string;
        side?: import(".").AnchorSide;
        align?: "start" | "center" | "end";
        gap?: number;
        showArrow?: boolean;
        width?: string;
        zIndex?: number;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        side: import(".").AnchorSide;
        zIndex: number;
        align: "start" | "center" | "end";
        gap: number;
        acceptLabel: string;
        rejectLabel: string;
        showArrow: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            container?: (props: {
                options: import("./core/alert").AlertState;
                press: (b: import(".").AlertButton, index?: number) => Promise<void>;
                close: () => void;
                buttons: import(".").AlertButton[];
            }) => any;
        } & {
            message?: (props: {
                options: import("./core/alert").AlertState;
            }) => any;
        };
    });
    Drawer: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexOverlayClasses & {
            visible?: boolean;
            header?: string;
            subtitle?: string;
            icon?: string;
            position?: import("./components/ApexDrawer.vue").DrawerPosition;
            size?: string;
            responsiveSize?: string;
            breakpoint?: string;
            modal?: boolean;
            closable?: boolean;
            closeOnEscape?: boolean;
            dismissableMask?: boolean;
            showHeader?: boolean;
            padding?: string;
            background?: string;
            borderColor?: string;
            maskColor?: string;
            maskBlur?: boolean;
            radius?: string;
            inset?: string;
            zIndex?: number;
            contentClass?: string;
        }> & Readonly<{
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
            "onUpdate:visible"?: ((v: boolean) => any) | undefined;
            "onAfter-hide"?: (() => any) | undefined;
        }>, {
            close: () => void;
            panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:visible": (v: boolean) => void;
            show: () => void;
            hide: () => void;
            "after-hide": () => void;
        }, import("vue").PublicProps, {
            position: import("./components/ApexDrawer.vue").DrawerPosition;
            zIndex: number;
            modal: boolean;
            closable: boolean;
            closeOnEscape: boolean;
            breakpoint: string;
            showHeader: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexOverlayClasses & {
            visible?: boolean;
            header?: string;
            subtitle?: string;
            icon?: string;
            position?: import("./components/ApexDrawer.vue").DrawerPosition;
            size?: string;
            responsiveSize?: string;
            breakpoint?: string;
            modal?: boolean;
            closable?: boolean;
            closeOnEscape?: boolean;
            dismissableMask?: boolean;
            showHeader?: boolean;
            padding?: string;
            background?: string;
            borderColor?: string;
            maskColor?: string;
            maskBlur?: boolean;
            radius?: string;
            inset?: string;
            zIndex?: number;
            contentClass?: string;
        }> & Readonly<{
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
            "onUpdate:visible"?: ((v: boolean) => any) | undefined;
            "onAfter-hide"?: (() => any) | undefined;
        }>, {
            close: () => void;
            panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
        }, {}, {}, {}, {
            position: import("./components/ApexDrawer.vue").DrawerPosition;
            zIndex: number;
            modal: boolean;
            closable: boolean;
            closeOnEscape: boolean;
            breakpoint: string;
            showHeader: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexOverlayClasses & {
        visible?: boolean;
        header?: string;
        subtitle?: string;
        icon?: string;
        position?: import("./components/ApexDrawer.vue").DrawerPosition;
        size?: string;
        responsiveSize?: string;
        breakpoint?: string;
        modal?: boolean;
        closable?: boolean;
        closeOnEscape?: boolean;
        dismissableMask?: boolean;
        showHeader?: boolean;
        padding?: string;
        background?: string;
        borderColor?: string;
        maskColor?: string;
        maskBlur?: boolean;
        radius?: string;
        inset?: string;
        zIndex?: number;
        contentClass?: string;
    }> & Readonly<{
        onShow?: (() => any) | undefined;
        onHide?: (() => any) | undefined;
        "onUpdate:visible"?: ((v: boolean) => any) | undefined;
        "onAfter-hide"?: (() => any) | undefined;
    }>, {
        close: () => void;
        panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:visible": (v: boolean) => void;
        show: () => void;
        hide: () => void;
        "after-hide": () => void;
    }, string, {
        position: import("./components/ApexDrawer.vue").DrawerPosition;
        zIndex: number;
        modal: boolean;
        closable: boolean;
        closeOnEscape: boolean;
        breakpoint: string;
        showHeader: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            container?: (props: {
                close: () => void;
            }) => any;
        } & {
            header?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        } & {
            footer?: (props: {}) => any;
        };
    });
    DynamicDialog: import("vue").DefineComponent<{}, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    Popover: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexOverlayClasses & {
            visible?: boolean;
            target?: unknown;
            side?: import(".").AnchorSide;
            align?: import(".").AnchorAlign;
            gap?: number;
            showArrow?: boolean;
            dismissable?: boolean;
            closeOnEscape?: boolean;
            autoFocus?: boolean;
            trapFocus?: boolean;
            width?: string;
            maxHeight?: string;
            padding?: string;
            background?: string;
            radius?: string;
            borderColor?: string;
            zIndex?: number;
            contentClass?: string;
        }> & Readonly<{
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
            "onUpdate:visible"?: ((v: boolean) => any) | undefined;
        }>, {
            show: (event?: unknown, target?: unknown) => void;
            hide: () => void;
            toggle: (event?: unknown, target?: unknown) => void;
            reposition: () => void;
            visible: import("vue").Ref<boolean, boolean>;
            panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:visible": (v: boolean) => void;
            show: () => void;
            hide: () => void;
        }, import("vue").PublicProps, {
            side: import(".").AnchorSide;
            zIndex: number;
            align: import(".").AnchorAlign;
            gap: number;
            closeOnEscape: boolean;
            dismissable: boolean;
            autoFocus: boolean;
            showArrow: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexOverlayClasses & {
            visible?: boolean;
            target?: unknown;
            side?: import(".").AnchorSide;
            align?: import(".").AnchorAlign;
            gap?: number;
            showArrow?: boolean;
            dismissable?: boolean;
            closeOnEscape?: boolean;
            autoFocus?: boolean;
            trapFocus?: boolean;
            width?: string;
            maxHeight?: string;
            padding?: string;
            background?: string;
            radius?: string;
            borderColor?: string;
            zIndex?: number;
            contentClass?: string;
        }> & Readonly<{
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
            "onUpdate:visible"?: ((v: boolean) => any) | undefined;
        }>, {
            show: (event?: unknown, target?: unknown) => void;
            hide: () => void;
            toggle: (event?: unknown, target?: unknown) => void;
            reposition: () => void;
            visible: import("vue").Ref<boolean, boolean>;
            panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
        }, {}, {}, {}, {
            side: import(".").AnchorSide;
            zIndex: number;
            align: import(".").AnchorAlign;
            gap: number;
            closeOnEscape: boolean;
            dismissable: boolean;
            autoFocus: boolean;
            showArrow: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexOverlayClasses & {
        visible?: boolean;
        target?: unknown;
        side?: import(".").AnchorSide;
        align?: import(".").AnchorAlign;
        gap?: number;
        showArrow?: boolean;
        dismissable?: boolean;
        closeOnEscape?: boolean;
        autoFocus?: boolean;
        trapFocus?: boolean;
        width?: string;
        maxHeight?: string;
        padding?: string;
        background?: string;
        radius?: string;
        borderColor?: string;
        zIndex?: number;
        contentClass?: string;
    }> & Readonly<{
        onShow?: (() => any) | undefined;
        onHide?: (() => any) | undefined;
        "onUpdate:visible"?: ((v: boolean) => any) | undefined;
    }>, {
        show: (event?: unknown, target?: unknown) => void;
        hide: () => void;
        toggle: (event?: unknown, target?: unknown) => void;
        reposition: () => void;
        visible: import("vue").Ref<boolean, boolean>;
        panel: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:visible": (v: boolean) => void;
        show: () => void;
        hide: () => void;
    }, string, {
        side: import(".").AnchorSide;
        zIndex: number;
        align: import(".").AnchorAlign;
        gap: number;
        closeOnEscape: boolean;
        dismissable: boolean;
        autoFocus: boolean;
        showArrow: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {
                hide: () => void;
            }) => any;
        };
    });
    FileUpload: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            modelValue?: File[];
            mode?: "basic" | "advanced";
            name?: string;
            url?: string;
            method?: string;
            headers?: Record<string, string>;
            withCredentials?: boolean;
            multiple?: boolean;
            accept?: string;
            maxFileSize?: number;
            maxTotalSize?: number;
            maxFiles?: number;
            auto?: boolean;
            customUpload?: boolean;
            disabled?: boolean;
            layout?: "list" | "grid";
            previewSize?: number;
            showButtons?: boolean;
            dropzone?: boolean;
            chooseLabel?: string;
            uploadLabel?: string;
            cancelLabel?: string;
            chooseIcon?: string;
            uploadIcon?: string;
            cancelIcon?: string;
            chooseSeverity?: import(".").ApexSeverity;
            uploadSeverity?: import(".").ApexSeverity;
            cancelSeverity?: import(".").ApexSeverity;
            chooseVariant?: "solid" | "outlined" | "text";
            uploadVariant?: "solid" | "outlined" | "text";
            cancelVariant?: "solid" | "outlined" | "text";
            buttonSize?: "sm" | "md" | "lg";
            buttonsRounded?: boolean;
            emptyLabel?: string;
            hint?: string;
            invalidTypeMessage?: string;
            invalidSizeMessage?: string;
            invalidLimitMessage?: string;
            width?: string;
            background?: string;
            borderColor?: string;
            radius?: string;
        }> & Readonly<{
            onProgress?: ((payload: {
                progress: number;
                file?: File;
            }) => any) | undefined;
            onSelect?: ((payload?: unknown) => any) | undefined;
            onError?: ((payload: {
                files?: File[];
                message: string;
                xhr?: XMLHttpRequest;
            }) => any) | undefined;
            "onUpdate:modelValue"?: ((v: File[]) => any) | undefined;
            onClear?: ((payload?: unknown) => any) | undefined;
            onRemove?: ((payload?: unknown) => any) | undefined;
            onUpload?: ((payload: {
                files: File[];
                response?: unknown;
            }) => any) | undefined;
            "onBefore-upload"?: ((payload: {
                formData: FormData;
                xhr: XMLHttpRequest;
            }) => any) | undefined;
            onUploader?: ((payload: {
                files: File[];
                clear: () => void;
                setProgress: (n: number) => void;
            }) => any) | undefined;
        }>, {
            choose: () => void;
            upload: () => void;
            clear: () => void;
            removeFile: (index: number) => void;
            files: import("vue").Ref<{
                file: {
                    readonly lastModified: number;
                    readonly name: string;
                    readonly webkitRelativePath: string;
                    readonly size: number;
                    readonly type: string;
                    arrayBuffer: () => Promise<ArrayBuffer>;
                    bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                    slice: (start?: number, end?: number, contentType?: string) => Blob;
                    stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                    text: () => Promise<string>;
                };
                preview?: string | undefined;
                progress: number;
                status: "pending" | "uploading" | "complete" | "error";
                error?: string | undefined;
            }[], import(".").UploadFile[] | {
                file: {
                    readonly lastModified: number;
                    readonly name: string;
                    readonly webkitRelativePath: string;
                    readonly size: number;
                    readonly type: string;
                    arrayBuffer: () => Promise<ArrayBuffer>;
                    bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                    slice: (start?: number, end?: number, contentType?: string) => Blob;
                    stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                    text: () => Promise<string>;
                };
                preview?: string | undefined;
                progress: number;
                status: "pending" | "uploading" | "complete" | "error";
                error?: string | undefined;
            }[]>;
            uploadedFiles: import("vue").Ref<{
                file: {
                    readonly lastModified: number;
                    readonly name: string;
                    readonly webkitRelativePath: string;
                    readonly size: number;
                    readonly type: string;
                    arrayBuffer: () => Promise<ArrayBuffer>;
                    bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                    slice: (start?: number, end?: number, contentType?: string) => Blob;
                    stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                    text: () => Promise<string>;
                };
                preview?: string | undefined;
                progress: number;
                status: "pending" | "uploading" | "complete" | "error";
                error?: string | undefined;
            }[], import(".").UploadFile[] | {
                file: {
                    readonly lastModified: number;
                    readonly name: string;
                    readonly webkitRelativePath: string;
                    readonly size: number;
                    readonly type: string;
                    arrayBuffer: () => Promise<ArrayBuffer>;
                    bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                    slice: (start?: number, end?: number, contentType?: string) => Blob;
                    stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                    text: () => Promise<string>;
                };
                preview?: string | undefined;
                progress: number;
                status: "pending" | "uploading" | "complete" | "error";
                error?: string | undefined;
            }[]>;
            formatSize: (bytes: number) => string;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:modelValue": (v: File[]) => void;
            select: (payload?: unknown) => void;
            clear: (payload?: unknown) => void;
            remove: (payload?: unknown) => void;
            "before-upload": (payload: {
                formData: FormData;
                xhr: XMLHttpRequest;
            }) => void;
            progress: (payload: {
                progress: number;
                file?: File;
            }) => void;
            upload: (payload: {
                files: File[];
                response?: unknown;
            }) => void;
            error: (payload: {
                files?: File[];
                message: string;
                xhr?: XMLHttpRequest;
            }) => void;
            uploader: (payload: {
                files: File[];
                clear: () => void;
                setProgress: (n: number) => void;
            }) => void;
        }, import("vue").PublicProps, {
            name: string;
            mode: "basic" | "advanced";
            layout: "list" | "grid";
            method: string;
            previewSize: number;
            showButtons: boolean;
            dropzone: boolean;
            chooseLabel: string;
            uploadLabel: string;
            cancelLabel: string;
            chooseIcon: string;
            uploadIcon: string;
            cancelIcon: string;
            chooseSeverity: import(".").ApexSeverity;
            uploadSeverity: import(".").ApexSeverity;
            cancelSeverity: import(".").ApexSeverity;
            chooseVariant: "solid" | "outlined" | "text";
            uploadVariant: "solid" | "outlined" | "text";
            cancelVariant: "solid" | "outlined" | "text";
            emptyLabel: string;
            invalidTypeMessage: string;
            invalidSizeMessage: string;
            invalidLimitMessage: string;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            modelValue?: File[];
            mode?: "basic" | "advanced";
            name?: string;
            url?: string;
            method?: string;
            headers?: Record<string, string>;
            withCredentials?: boolean;
            multiple?: boolean;
            accept?: string;
            maxFileSize?: number;
            maxTotalSize?: number;
            maxFiles?: number;
            auto?: boolean;
            customUpload?: boolean;
            disabled?: boolean;
            layout?: "list" | "grid";
            previewSize?: number;
            showButtons?: boolean;
            dropzone?: boolean;
            chooseLabel?: string;
            uploadLabel?: string;
            cancelLabel?: string;
            chooseIcon?: string;
            uploadIcon?: string;
            cancelIcon?: string;
            chooseSeverity?: import(".").ApexSeverity;
            uploadSeverity?: import(".").ApexSeverity;
            cancelSeverity?: import(".").ApexSeverity;
            chooseVariant?: "solid" | "outlined" | "text";
            uploadVariant?: "solid" | "outlined" | "text";
            cancelVariant?: "solid" | "outlined" | "text";
            buttonSize?: "sm" | "md" | "lg";
            buttonsRounded?: boolean;
            emptyLabel?: string;
            hint?: string;
            invalidTypeMessage?: string;
            invalidSizeMessage?: string;
            invalidLimitMessage?: string;
            width?: string;
            background?: string;
            borderColor?: string;
            radius?: string;
        }> & Readonly<{
            onProgress?: ((payload: {
                progress: number;
                file?: File;
            }) => any) | undefined;
            onSelect?: ((payload?: unknown) => any) | undefined;
            onError?: ((payload: {
                files?: File[];
                message: string;
                xhr?: XMLHttpRequest;
            }) => any) | undefined;
            "onUpdate:modelValue"?: ((v: File[]) => any) | undefined;
            onClear?: ((payload?: unknown) => any) | undefined;
            onRemove?: ((payload?: unknown) => any) | undefined;
            onUpload?: ((payload: {
                files: File[];
                response?: unknown;
            }) => any) | undefined;
            "onBefore-upload"?: ((payload: {
                formData: FormData;
                xhr: XMLHttpRequest;
            }) => any) | undefined;
            onUploader?: ((payload: {
                files: File[];
                clear: () => void;
                setProgress: (n: number) => void;
            }) => any) | undefined;
        }>, {
            choose: () => void;
            upload: () => void;
            clear: () => void;
            removeFile: (index: number) => void;
            files: import("vue").Ref<{
                file: {
                    readonly lastModified: number;
                    readonly name: string;
                    readonly webkitRelativePath: string;
                    readonly size: number;
                    readonly type: string;
                    arrayBuffer: () => Promise<ArrayBuffer>;
                    bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                    slice: (start?: number, end?: number, contentType?: string) => Blob;
                    stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                    text: () => Promise<string>;
                };
                preview?: string | undefined;
                progress: number;
                status: "pending" | "uploading" | "complete" | "error";
                error?: string | undefined;
            }[], import(".").UploadFile[] | {
                file: {
                    readonly lastModified: number;
                    readonly name: string;
                    readonly webkitRelativePath: string;
                    readonly size: number;
                    readonly type: string;
                    arrayBuffer: () => Promise<ArrayBuffer>;
                    bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                    slice: (start?: number, end?: number, contentType?: string) => Blob;
                    stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                    text: () => Promise<string>;
                };
                preview?: string | undefined;
                progress: number;
                status: "pending" | "uploading" | "complete" | "error";
                error?: string | undefined;
            }[]>;
            uploadedFiles: import("vue").Ref<{
                file: {
                    readonly lastModified: number;
                    readonly name: string;
                    readonly webkitRelativePath: string;
                    readonly size: number;
                    readonly type: string;
                    arrayBuffer: () => Promise<ArrayBuffer>;
                    bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                    slice: (start?: number, end?: number, contentType?: string) => Blob;
                    stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                    text: () => Promise<string>;
                };
                preview?: string | undefined;
                progress: number;
                status: "pending" | "uploading" | "complete" | "error";
                error?: string | undefined;
            }[], import(".").UploadFile[] | {
                file: {
                    readonly lastModified: number;
                    readonly name: string;
                    readonly webkitRelativePath: string;
                    readonly size: number;
                    readonly type: string;
                    arrayBuffer: () => Promise<ArrayBuffer>;
                    bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                    slice: (start?: number, end?: number, contentType?: string) => Blob;
                    stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                    text: () => Promise<string>;
                };
                preview?: string | undefined;
                progress: number;
                status: "pending" | "uploading" | "complete" | "error";
                error?: string | undefined;
            }[]>;
            formatSize: (bytes: number) => string;
        }, {}, {}, {}, {
            name: string;
            mode: "basic" | "advanced";
            layout: "list" | "grid";
            method: string;
            previewSize: number;
            showButtons: boolean;
            dropzone: boolean;
            chooseLabel: string;
            uploadLabel: string;
            cancelLabel: string;
            chooseIcon: string;
            uploadIcon: string;
            cancelIcon: string;
            chooseSeverity: import(".").ApexSeverity;
            uploadSeverity: import(".").ApexSeverity;
            cancelSeverity: import(".").ApexSeverity;
            chooseVariant: "solid" | "outlined" | "text";
            uploadVariant: "solid" | "outlined" | "text";
            cancelVariant: "solid" | "outlined" | "text";
            emptyLabel: string;
            invalidTypeMessage: string;
            invalidSizeMessage: string;
            invalidLimitMessage: string;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        modelValue?: File[];
        mode?: "basic" | "advanced";
        name?: string;
        url?: string;
        method?: string;
        headers?: Record<string, string>;
        withCredentials?: boolean;
        multiple?: boolean;
        accept?: string;
        maxFileSize?: number;
        maxTotalSize?: number;
        maxFiles?: number;
        auto?: boolean;
        customUpload?: boolean;
        disabled?: boolean;
        layout?: "list" | "grid";
        previewSize?: number;
        showButtons?: boolean;
        dropzone?: boolean;
        chooseLabel?: string;
        uploadLabel?: string;
        cancelLabel?: string;
        chooseIcon?: string;
        uploadIcon?: string;
        cancelIcon?: string;
        chooseSeverity?: import(".").ApexSeverity;
        uploadSeverity?: import(".").ApexSeverity;
        cancelSeverity?: import(".").ApexSeverity;
        chooseVariant?: "solid" | "outlined" | "text";
        uploadVariant?: "solid" | "outlined" | "text";
        cancelVariant?: "solid" | "outlined" | "text";
        buttonSize?: "sm" | "md" | "lg";
        buttonsRounded?: boolean;
        emptyLabel?: string;
        hint?: string;
        invalidTypeMessage?: string;
        invalidSizeMessage?: string;
        invalidLimitMessage?: string;
        width?: string;
        background?: string;
        borderColor?: string;
        radius?: string;
    }> & Readonly<{
        onProgress?: ((payload: {
            progress: number;
            file?: File;
        }) => any) | undefined;
        onSelect?: ((payload?: unknown) => any) | undefined;
        onError?: ((payload: {
            files?: File[];
            message: string;
            xhr?: XMLHttpRequest;
        }) => any) | undefined;
        "onUpdate:modelValue"?: ((v: File[]) => any) | undefined;
        onClear?: ((payload?: unknown) => any) | undefined;
        onRemove?: ((payload?: unknown) => any) | undefined;
        onUpload?: ((payload: {
            files: File[];
            response?: unknown;
        }) => any) | undefined;
        "onBefore-upload"?: ((payload: {
            formData: FormData;
            xhr: XMLHttpRequest;
        }) => any) | undefined;
        onUploader?: ((payload: {
            files: File[];
            clear: () => void;
            setProgress: (n: number) => void;
        }) => any) | undefined;
    }>, {
        choose: () => void;
        upload: () => void;
        clear: () => void;
        removeFile: (index: number) => void;
        files: import("vue").Ref<{
            file: {
                readonly lastModified: number;
                readonly name: string;
                readonly webkitRelativePath: string;
                readonly size: number;
                readonly type: string;
                arrayBuffer: () => Promise<ArrayBuffer>;
                bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                slice: (start?: number, end?: number, contentType?: string) => Blob;
                stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                text: () => Promise<string>;
            };
            preview?: string | undefined;
            progress: number;
            status: "pending" | "uploading" | "complete" | "error";
            error?: string | undefined;
        }[], import(".").UploadFile[] | {
            file: {
                readonly lastModified: number;
                readonly name: string;
                readonly webkitRelativePath: string;
                readonly size: number;
                readonly type: string;
                arrayBuffer: () => Promise<ArrayBuffer>;
                bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                slice: (start?: number, end?: number, contentType?: string) => Blob;
                stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                text: () => Promise<string>;
            };
            preview?: string | undefined;
            progress: number;
            status: "pending" | "uploading" | "complete" | "error";
            error?: string | undefined;
        }[]>;
        uploadedFiles: import("vue").Ref<{
            file: {
                readonly lastModified: number;
                readonly name: string;
                readonly webkitRelativePath: string;
                readonly size: number;
                readonly type: string;
                arrayBuffer: () => Promise<ArrayBuffer>;
                bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                slice: (start?: number, end?: number, contentType?: string) => Blob;
                stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                text: () => Promise<string>;
            };
            preview?: string | undefined;
            progress: number;
            status: "pending" | "uploading" | "complete" | "error";
            error?: string | undefined;
        }[], import(".").UploadFile[] | {
            file: {
                readonly lastModified: number;
                readonly name: string;
                readonly webkitRelativePath: string;
                readonly size: number;
                readonly type: string;
                arrayBuffer: () => Promise<ArrayBuffer>;
                bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                slice: (start?: number, end?: number, contentType?: string) => Blob;
                stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                text: () => Promise<string>;
            };
            preview?: string | undefined;
            progress: number;
            status: "pending" | "uploading" | "complete" | "error";
            error?: string | undefined;
        }[]>;
        formatSize: (bytes: number) => string;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (v: File[]) => void;
        select: (payload?: unknown) => void;
        clear: (payload?: unknown) => void;
        remove: (payload?: unknown) => void;
        "before-upload": (payload: {
            formData: FormData;
            xhr: XMLHttpRequest;
        }) => void;
        progress: (payload: {
            progress: number;
            file?: File;
        }) => void;
        upload: (payload: {
            files: File[];
            response?: unknown;
        }) => void;
        error: (payload: {
            files?: File[];
            message: string;
            xhr?: XMLHttpRequest;
        }) => void;
        uploader: (payload: {
            files: File[];
            clear: () => void;
            setProgress: (n: number) => void;
        }) => void;
    }, string, {
        name: string;
        mode: "basic" | "advanced";
        layout: "list" | "grid";
        method: string;
        previewSize: number;
        showButtons: boolean;
        dropzone: boolean;
        chooseLabel: string;
        uploadLabel: string;
        cancelLabel: string;
        chooseIcon: string;
        uploadIcon: string;
        cancelIcon: string;
        chooseSeverity: import(".").ApexSeverity;
        uploadSeverity: import(".").ApexSeverity;
        cancelSeverity: import(".").ApexSeverity;
        chooseVariant: "solid" | "outlined" | "text";
        uploadVariant: "solid" | "outlined" | "text";
        cancelVariant: "solid" | "outlined" | "text";
        emptyLabel: string;
        invalidTypeMessage: string;
        invalidSizeMessage: string;
        invalidLimitMessage: string;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            header?: (props: {
                files: {
                    file: {
                        readonly lastModified: number;
                        readonly name: string;
                        readonly webkitRelativePath: string;
                        readonly size: number;
                        readonly type: string;
                        arrayBuffer: () => Promise<ArrayBuffer>;
                        bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                        slice: (start?: number, end?: number, contentType?: string) => Blob;
                        stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                        text: () => Promise<string>;
                    };
                    preview?: string | undefined;
                    progress: number;
                    status: "pending" | "uploading" | "complete" | "error";
                    error?: string | undefined;
                }[];
                uploadedFiles: {
                    file: {
                        readonly lastModified: number;
                        readonly name: string;
                        readonly webkitRelativePath: string;
                        readonly size: number;
                        readonly type: string;
                        arrayBuffer: () => Promise<ArrayBuffer>;
                        bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                        slice: (start?: number, end?: number, contentType?: string) => Blob;
                        stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                        text: () => Promise<string>;
                    };
                    preview?: string | undefined;
                    progress: number;
                    status: "pending" | "uploading" | "complete" | "error";
                    error?: string | undefined;
                }[];
                chooseCallback: () => void;
                uploadCallback: () => void;
                clearCallback: () => void;
                removeFileCallback: (index: number) => void;
                removeUploadedFileCallback: (index: number) => void;
                progress: number;
                messages: string[];
                formatSize: (bytes: number) => string;
            }) => any;
        } & {
            content?: (props: {
                files: {
                    file: {
                        readonly lastModified: number;
                        readonly name: string;
                        readonly webkitRelativePath: string;
                        readonly size: number;
                        readonly type: string;
                        arrayBuffer: () => Promise<ArrayBuffer>;
                        bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                        slice: (start?: number, end?: number, contentType?: string) => Blob;
                        stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                        text: () => Promise<string>;
                    };
                    preview?: string | undefined;
                    progress: number;
                    status: "pending" | "uploading" | "complete" | "error";
                    error?: string | undefined;
                }[];
                uploadedFiles: {
                    file: {
                        readonly lastModified: number;
                        readonly name: string;
                        readonly webkitRelativePath: string;
                        readonly size: number;
                        readonly type: string;
                        arrayBuffer: () => Promise<ArrayBuffer>;
                        bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                        slice: (start?: number, end?: number, contentType?: string) => Blob;
                        stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                        text: () => Promise<string>;
                    };
                    preview?: string | undefined;
                    progress: number;
                    status: "pending" | "uploading" | "complete" | "error";
                    error?: string | undefined;
                }[];
                chooseCallback: () => void;
                uploadCallback: () => void;
                clearCallback: () => void;
                removeFileCallback: (index: number) => void;
                removeUploadedFileCallback: (index: number) => void;
                progress: number;
                messages: string[];
                formatSize: (bytes: number) => string;
            }) => any;
        } & {
            file?: (props: {
                file: {
                    file: {
                        readonly lastModified: number;
                        readonly name: string;
                        readonly webkitRelativePath: string;
                        readonly size: number;
                        readonly type: string;
                        arrayBuffer: () => Promise<ArrayBuffer>;
                        bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                        slice: (start?: number, end?: number, contentType?: string) => Blob;
                        stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                        text: () => Promise<string>;
                    };
                    preview?: string | undefined;
                    progress: number;
                    status: "pending" | "uploading" | "complete" | "error";
                    error?: string | undefined;
                };
                index: number;
                removeFileCallback: (index: number) => void;
                formatSize: (bytes: number) => string;
            }) => any;
        } & {
            empty?: (props: {}) => any;
        } & {
            footer?: (props: {
                files: {
                    file: {
                        readonly lastModified: number;
                        readonly name: string;
                        readonly webkitRelativePath: string;
                        readonly size: number;
                        readonly type: string;
                        arrayBuffer: () => Promise<ArrayBuffer>;
                        bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                        slice: (start?: number, end?: number, contentType?: string) => Blob;
                        stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                        text: () => Promise<string>;
                    };
                    preview?: string | undefined;
                    progress: number;
                    status: "pending" | "uploading" | "complete" | "error";
                    error?: string | undefined;
                }[];
                uploadedFiles: {
                    file: {
                        readonly lastModified: number;
                        readonly name: string;
                        readonly webkitRelativePath: string;
                        readonly size: number;
                        readonly type: string;
                        arrayBuffer: () => Promise<ArrayBuffer>;
                        bytes: () => Promise<Uint8Array<ArrayBuffer>>;
                        slice: (start?: number, end?: number, contentType?: string) => Blob;
                        stream: () => ReadableStream<Uint8Array<ArrayBuffer>>;
                        text: () => Promise<string>;
                    };
                    preview?: string | undefined;
                    progress: number;
                    status: "pending" | "uploading" | "complete" | "error";
                    error?: string | undefined;
                }[];
                chooseCallback: () => void;
                uploadCallback: () => void;
                clearCallback: () => void;
                removeFileCallback: (index: number) => void;
                removeUploadedFileCallback: (index: number) => void;
                progress: number;
                messages: string[];
                formatSize: (bytes: number) => string;
            }) => any;
        };
    });
    ImageCrop: import("vue").DefineComponent<{
        src?: File | Blob | string | null;
        target?: {
            width: number;
            height: number;
        } | null;
        mode?: "auto" | "manual";
        lockRatio?: boolean;
        type?: string;
        quality?: number;
        maxDim?: number | null;
        showControls?: boolean;
        maxHeight?: number;
        background?: string;
        scrimColor?: string;
        handleColor?: string;
    }, {
        render: () => Promise<{
            blob: Blob;
            rect: {
                x: number;
                y: number;
                w: number;
                h: number;
            };
            width: number;
            height: number;
        }>;
        auto: () => void;
        reset: () => void;
        rect: import("vue").Ref<{
            x: number;
            y: number;
            w: number;
            h: number;
        }, {
            x: number;
            y: number;
            w: number;
            h: number;
        } | {
            x: number;
            y: number;
            w: number;
            h: number;
        }>;
        natural: import("vue").Ref<{
            width: number;
            height: number;
        }, {
            width: number;
            height: number;
        } | {
            width: number;
            height: number;
        }>;
        output: import("vue").ComputedRef<{
            width: number;
            height: number;
        }>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        warning: (v: {
            code: "below-target" | "source-below-target";
            message: string;
        }) => any;
        error: (v: {
            message: string;
        }) => any;
        ready: (v: {
            width: number;
            height: number;
        }) => any;
        "update:rect": (v: {
            x: number;
            y: number;
            w: number;
            h: number;
        }) => any;
    }, string, import("vue").PublicProps, Readonly<{
        src?: File | Blob | string | null;
        target?: {
            width: number;
            height: number;
        } | null;
        mode?: "auto" | "manual";
        lockRatio?: boolean;
        type?: string;
        quality?: number;
        maxDim?: number | null;
        showControls?: boolean;
        maxHeight?: number;
        background?: string;
        scrimColor?: string;
        handleColor?: string;
    }> & Readonly<{
        onWarning?: ((v: {
            code: "below-target" | "source-below-target";
            message: string;
        }) => any) | undefined;
        onError?: ((v: {
            message: string;
        }) => any) | undefined;
        onReady?: ((v: {
            width: number;
            height: number;
        }) => any) | undefined;
        "onUpdate:rect"?: ((v: {
            x: number;
            y: number;
            w: number;
            h: number;
        }) => any) | undefined;
    }>, {
        type: string;
        target: {
            width: number;
            height: number;
        } | null;
        src: File | Blob | string | null;
        maxHeight: number;
        mode: "auto" | "manual";
        showControls: boolean;
        lockRatio: boolean;
        quality: number;
        maxDim: number | null;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    ImageField: import("vue").DefineComponent<import("./types").ApexFieldProps & {
        modelValue?: File | null;
        removed?: boolean;
        previewUrl?: string | null;
        target?: {
            width: number;
            height: number;
        } | null;
        lockRatio?: boolean;
        accept?: string;
        maxFileSize?: number;
        type?: string;
        quality?: number;
        maxDim?: number | null;
        previewWidth?: number;
        chooseLabel?: string;
        replaceLabel?: string;
        removeLabel?: string;
        emptyLabel?: string;
        hint?: string;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        warning: (v: {
            code: string;
            message: string;
        }) => any;
        error: (v: {
            message: string;
        }) => any;
        "update:modelValue": (v: File | null) => any;
        "update:removed": (v: boolean) => any;
    }, string, import("vue").PublicProps, Readonly<import("./types").ApexFieldProps & {
        modelValue?: File | null;
        removed?: boolean;
        previewUrl?: string | null;
        target?: {
            width: number;
            height: number;
        } | null;
        lockRatio?: boolean;
        accept?: string;
        maxFileSize?: number;
        type?: string;
        quality?: number;
        maxDim?: number | null;
        previewWidth?: number;
        chooseLabel?: string;
        replaceLabel?: string;
        removeLabel?: string;
        emptyLabel?: string;
        hint?: string;
    }> & Readonly<{
        onWarning?: ((v: {
            code: string;
            message: string;
        }) => any) | undefined;
        onError?: ((v: {
            message: string;
        }) => any) | undefined;
        "onUpdate:modelValue"?: ((v: File | null) => any) | undefined;
        "onUpdate:removed"?: ((v: boolean) => any) | undefined;
    }>, {
        type: string;
        modelValue: File | null;
        target: {
            width: number;
            height: number;
        } | null;
        accept: string;
        maxFileSize: number;
        chooseLabel: string;
        emptyLabel: string;
        lockRatio: boolean;
        quality: number;
        maxDim: number | null;
        removed: boolean;
        previewUrl: string | null;
        previewWidth: number;
        replaceLabel: string;
        removeLabel: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Breadcrumb: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            items?: import(".").CrumbItem[];
            home?: import(".").CrumbItem;
            separator?: string;
            maxItems?: number;
            markCurrent?: boolean;
            size?: "sm" | "md" | "lg";
            wrap?: boolean;
            linkComponent?: unknown;
            color?: string;
            activeColor?: string;
            hoverColor?: string;
            separatorColor?: string;
            gap?: string;
            background?: string;
            padding?: string;
            radius?: string;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").CrumbItem;
                index: number;
                originalEvent: MouseEvent;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "item-click": (payload: {
                item: import(".").CrumbItem;
                index: number;
                originalEvent: MouseEvent;
            }) => any;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            separator: string;
            markCurrent: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            items?: import(".").CrumbItem[];
            home?: import(".").CrumbItem;
            separator?: string;
            maxItems?: number;
            markCurrent?: boolean;
            size?: "sm" | "md" | "lg";
            wrap?: boolean;
            linkComponent?: unknown;
            color?: string;
            activeColor?: string;
            hoverColor?: string;
            separatorColor?: string;
            gap?: string;
            background?: string;
            padding?: string;
            radius?: string;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").CrumbItem;
                index: number;
                originalEvent: MouseEvent;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            separator: string;
            markCurrent: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        items?: import(".").CrumbItem[];
        home?: import(".").CrumbItem;
        separator?: string;
        maxItems?: number;
        markCurrent?: boolean;
        size?: "sm" | "md" | "lg";
        wrap?: boolean;
        linkComponent?: unknown;
        color?: string;
        activeColor?: string;
        hoverColor?: string;
        separatorColor?: string;
        gap?: string;
        background?: string;
        padding?: string;
        radius?: string;
    }> & Readonly<{
        "onItem-click"?: ((payload: {
            item: import(".").CrumbItem;
            index: number;
            originalEvent: MouseEvent;
        }) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "item-click": (payload: {
            item: import(".").CrumbItem;
            index: number;
            originalEvent: MouseEvent;
        }) => any;
    }, string, {
        size: "sm" | "md" | "lg";
        separator: string;
        markCurrent: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            ellipsis?: (props: {
                expand: () => boolean;
            }) => any;
        } & {
            item?: (props: {
                item: import(".").CrumbItem;
                index: number;
                isCurrent: boolean;
            }) => any;
        } & {
            separator?: (props: {}) => any;
        };
    });
    ContextMenu: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            items?: import(".").MenuItem[];
            target?: unknown;
            global?: boolean;
            disabled?: boolean;
            padding?: number;
            width?: string;
            background?: string;
            radius?: string;
            borderColor?: string;
            textColor?: string;
            hoverBackground?: string;
            hoverTextColor?: string;
            iconColor?: string;
            headerColor?: string;
            hintColor?: string;
            separatorColor?: string;
            rowRadius?: string;
            zIndex?: number;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
        }>, {
            show: (e: MouseEvent) => void;
            hide: () => void;
            toggle: (e: MouseEvent) => void;
            visible: import("vue").Ref<boolean, boolean>;
            target: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            show: () => void;
            hide: () => void;
            "item-click": (payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => void;
        }, import("vue").PublicProps, {
            zIndex: number;
            padding: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            items?: import(".").MenuItem[];
            target?: unknown;
            global?: boolean;
            disabled?: boolean;
            padding?: number;
            width?: string;
            background?: string;
            radius?: string;
            borderColor?: string;
            textColor?: string;
            hoverBackground?: string;
            hoverTextColor?: string;
            iconColor?: string;
            headerColor?: string;
            hintColor?: string;
            separatorColor?: string;
            rowRadius?: string;
            zIndex?: number;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
        }>, {
            show: (e: MouseEvent) => void;
            hide: () => void;
            toggle: (e: MouseEvent) => void;
            visible: import("vue").Ref<boolean, boolean>;
            target: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
        }, {}, {}, {}, {
            zIndex: number;
            padding: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        items?: import(".").MenuItem[];
        target?: unknown;
        global?: boolean;
        disabled?: boolean;
        padding?: number;
        width?: string;
        background?: string;
        radius?: string;
        borderColor?: string;
        textColor?: string;
        hoverBackground?: string;
        hoverTextColor?: string;
        iconColor?: string;
        headerColor?: string;
        hintColor?: string;
        separatorColor?: string;
        rowRadius?: string;
        zIndex?: number;
    }> & Readonly<{
        "onItem-click"?: ((payload: {
            item: import(".").MenuItem;
            originalEvent: MouseEvent;
        }) => any) | undefined;
        onShow?: (() => any) | undefined;
        onHide?: (() => any) | undefined;
    }>, {
        show: (e: MouseEvent) => void;
        hide: () => void;
        toggle: (e: MouseEvent) => void;
        visible: import("vue").Ref<boolean, boolean>;
        target: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        show: () => void;
        hide: () => void;
        "item-click": (payload: {
            item: import(".").MenuItem;
            originalEvent: MouseEvent;
        }) => void;
    }, string, {
        zIndex: number;
        padding: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            item?: (props: {
                item: import(".").MenuItem;
                depth: number;
                branch: boolean;
            }) => unknown;
        };
    });
    Dock: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            items?: import(".").MenuItem[];
            position?: "bottom" | "top" | "left" | "right";
            magnify?: boolean;
            size?: number;
            showLabels?: boolean;
            fanGap?: number;
            disabled?: boolean;
            gap?: string;
            padding?: string;
            radius?: string;
            background?: string;
            borderColor?: string;
            blur?: boolean;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                index: number;
                originalEvent: MouseEvent;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "item-click": (payload: {
                item: import(".").MenuItem;
                index: number;
                originalEvent: MouseEvent;
            }) => any;
        }, import("vue").PublicProps, {
            size: number;
            position: "bottom" | "top" | "left" | "right";
            showLabels: boolean;
            magnify: boolean;
            fanGap: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            items?: import(".").MenuItem[];
            position?: "bottom" | "top" | "left" | "right";
            magnify?: boolean;
            size?: number;
            showLabels?: boolean;
            fanGap?: number;
            disabled?: boolean;
            gap?: string;
            padding?: string;
            radius?: string;
            background?: string;
            borderColor?: string;
            blur?: boolean;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                index: number;
                originalEvent: MouseEvent;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, {
            size: number;
            position: "bottom" | "top" | "left" | "right";
            showLabels: boolean;
            magnify: boolean;
            fanGap: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        items?: import(".").MenuItem[];
        position?: "bottom" | "top" | "left" | "right";
        magnify?: boolean;
        size?: number;
        showLabels?: boolean;
        fanGap?: number;
        disabled?: boolean;
        gap?: string;
        padding?: string;
        radius?: string;
        background?: string;
        borderColor?: string;
        blur?: boolean;
    }> & Readonly<{
        "onItem-click"?: ((payload: {
            item: import(".").MenuItem;
            index: number;
            originalEvent: MouseEvent;
        }) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "item-click": (payload: {
            item: import(".").MenuItem;
            index: number;
            originalEvent: MouseEvent;
        }) => any;
    }, string, {
        size: number;
        position: "bottom" | "top" | "left" | "right";
        showLabels: boolean;
        magnify: boolean;
        fanGap: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            item?: (props: {
                item: import(".").MenuItem;
                index: number;
                inGroup: boolean;
            }) => any;
        } & {
            item?: (props: {
                item: import(".").MenuItem;
                index: number;
                inGroup: boolean;
            }) => any;
        };
    });
    MegaMenu: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            items?: import(".").MegaItem[];
            orientation?: "horizontal" | "vertical";
            trigger?: "hover" | "click";
            columnMinWidth?: string;
            cardMinWidth?: string;
            panelImagePosition?: "end" | "start";
            background?: string;
            panelBackground?: string;
            borderColor?: string;
            radius?: string;
            padding?: string;
            activeColor?: string;
            zIndex?: number;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MegaItem | import(".").MegaLink;
                originalEvent: MouseEvent;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "item-click": (payload: {
                item: import(".").MegaItem | import(".").MegaLink;
                originalEvent: MouseEvent;
            }) => any;
        }, import("vue").PublicProps, {
            zIndex: number;
            trigger: "hover" | "click";
            orientation: "horizontal" | "vertical";
            columnMinWidth: string;
            cardMinWidth: string;
            panelImagePosition: "end" | "start";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            items?: import(".").MegaItem[];
            orientation?: "horizontal" | "vertical";
            trigger?: "hover" | "click";
            columnMinWidth?: string;
            cardMinWidth?: string;
            panelImagePosition?: "end" | "start";
            background?: string;
            panelBackground?: string;
            borderColor?: string;
            radius?: string;
            padding?: string;
            activeColor?: string;
            zIndex?: number;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MegaItem | import(".").MegaLink;
                originalEvent: MouseEvent;
            }) => any) | undefined;
        }>, {}, {}, {}, {}, {
            zIndex: number;
            trigger: "hover" | "click";
            orientation: "horizontal" | "vertical";
            columnMinWidth: string;
            cardMinWidth: string;
            panelImagePosition: "end" | "start";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        items?: import(".").MegaItem[];
        orientation?: "horizontal" | "vertical";
        trigger?: "hover" | "click";
        columnMinWidth?: string;
        cardMinWidth?: string;
        panelImagePosition?: "end" | "start";
        background?: string;
        panelBackground?: string;
        borderColor?: string;
        radius?: string;
        padding?: string;
        activeColor?: string;
        zIndex?: number;
    }> & Readonly<{
        "onItem-click"?: ((payload: {
            item: import(".").MegaItem | import(".").MegaLink;
            originalEvent: MouseEvent;
        }) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "item-click": (payload: {
            item: import(".").MegaItem | import(".").MegaLink;
            originalEvent: MouseEvent;
        }) => any;
    }, string, {
        zIndex: number;
        trigger: "hover" | "click";
        orientation: "horizontal" | "vertical";
        columnMinWidth: string;
        cardMinWidth: string;
        panelImagePosition: "end" | "start";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            start?: (props: {}) => any;
        } & {
            panel?: (props: {
                item: import(".").MegaItem;
                close: () => number;
            }) => any;
        } & {
            item?: (props: {
                item: import(".").MegaLink;
                layout: "list" | "cards";
            }) => any;
        } & {
            end?: (props: {}) => any;
        };
    });
    Menu: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            items?: import(".").MenuItem[];
            expandedKeys?: Record<string, boolean>;
            popup?: boolean;
            side?: import(".").AnchorSide;
            align?: import(".").AnchorAlign;
            gap?: number;
            width?: string;
            maxHeight?: string;
            padding?: string;
            background?: string;
            borderColor?: string;
            radius?: string;
            labelCaps?: boolean;
            textColor?: string;
            hoverBackground?: string;
            hoverTextColor?: string;
            labelColor?: string;
            iconColor?: string;
            activeColor?: string;
            activeBackground?: string;
            zIndex?: number;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
            "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
        }>, {
            show: (event?: unknown, target?: unknown) => void;
            hide: () => void;
            toggle: (event?: unknown, target?: unknown) => void;
            expandAll: () => void;
            collapseAll: () => void;
            visible: import("vue").Ref<boolean, boolean>;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:expandedKeys": (v: Record<string, boolean>) => void;
            "item-click": (payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => void;
            show: () => void;
            hide: () => void;
        }, import("vue").PublicProps, {
            side: import(".").AnchorSide;
            zIndex: number;
            align: import(".").AnchorAlign;
            gap: number;
            labelCaps: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            items?: import(".").MenuItem[];
            expandedKeys?: Record<string, boolean>;
            popup?: boolean;
            side?: import(".").AnchorSide;
            align?: import(".").AnchorAlign;
            gap?: number;
            width?: string;
            maxHeight?: string;
            padding?: string;
            background?: string;
            borderColor?: string;
            radius?: string;
            labelCaps?: boolean;
            textColor?: string;
            hoverBackground?: string;
            hoverTextColor?: string;
            labelColor?: string;
            iconColor?: string;
            activeColor?: string;
            activeBackground?: string;
            zIndex?: number;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
            "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
        }>, {
            show: (event?: unknown, target?: unknown) => void;
            hide: () => void;
            toggle: (event?: unknown, target?: unknown) => void;
            expandAll: () => void;
            collapseAll: () => void;
            visible: import("vue").Ref<boolean, boolean>;
        }, {}, {}, {}, {
            side: import(".").AnchorSide;
            zIndex: number;
            align: import(".").AnchorAlign;
            gap: number;
            labelCaps: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        items?: import(".").MenuItem[];
        expandedKeys?: Record<string, boolean>;
        popup?: boolean;
        side?: import(".").AnchorSide;
        align?: import(".").AnchorAlign;
        gap?: number;
        width?: string;
        maxHeight?: string;
        padding?: string;
        background?: string;
        borderColor?: string;
        radius?: string;
        labelCaps?: boolean;
        textColor?: string;
        hoverBackground?: string;
        hoverTextColor?: string;
        labelColor?: string;
        iconColor?: string;
        activeColor?: string;
        activeBackground?: string;
        zIndex?: number;
    }> & Readonly<{
        "onItem-click"?: ((payload: {
            item: import(".").MenuItem;
            originalEvent: MouseEvent;
        }) => any) | undefined;
        onShow?: (() => any) | undefined;
        onHide?: (() => any) | undefined;
        "onUpdate:expandedKeys"?: ((v: Record<string, boolean>) => any) | undefined;
    }>, {
        show: (event?: unknown, target?: unknown) => void;
        hide: () => void;
        toggle: (event?: unknown, target?: unknown) => void;
        expandAll: () => void;
        collapseAll: () => void;
        visible: import("vue").Ref<boolean, boolean>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:expandedKeys": (v: Record<string, boolean>) => void;
        "item-click": (payload: {
            item: import(".").MenuItem;
            originalEvent: MouseEvent;
        }) => void;
        show: () => void;
        hide: () => void;
    }, string, {
        side: import(".").AnchorSide;
        zIndex: number;
        align: import(".").AnchorAlign;
        gap: number;
        labelCaps: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            start?: () => unknown;
            end?: () => unknown;
            item?: (props: {
                item: import(".").MenuItem;
                depth: number;
            }) => unknown;
            submenulabel?: (props: {
                item: import(".").MenuItem;
                depth: number;
            }) => unknown;
        };
    });
    Menubar: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            items?: import(".").MenuItem[];
            trigger?: "hover" | "click";
            size?: "sm" | "md" | "lg";
            background?: string;
            borderColor?: string;
            radius?: string;
            padding?: string;
            textColor?: string;
            hoverBackground?: string;
            hoverTextColor?: string;
            openBackground?: string;
            openTextColor?: string;
            iconColor?: string;
            zIndex?: number;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
        }>, {
            close: () => void;
            openIndex: import("vue").Ref<number, number>;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "item-click": (payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => any;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            zIndex: number;
            trigger: "hover" | "click";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            items?: import(".").MenuItem[];
            trigger?: "hover" | "click";
            size?: "sm" | "md" | "lg";
            background?: string;
            borderColor?: string;
            radius?: string;
            padding?: string;
            textColor?: string;
            hoverBackground?: string;
            hoverTextColor?: string;
            openBackground?: string;
            openTextColor?: string;
            iconColor?: string;
            zIndex?: number;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
        }>, {
            close: () => void;
            openIndex: import("vue").Ref<number, number>;
        }, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            zIndex: number;
            trigger: "hover" | "click";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        items?: import(".").MenuItem[];
        trigger?: "hover" | "click";
        size?: "sm" | "md" | "lg";
        background?: string;
        borderColor?: string;
        radius?: string;
        padding?: string;
        textColor?: string;
        hoverBackground?: string;
        hoverTextColor?: string;
        openBackground?: string;
        openTextColor?: string;
        iconColor?: string;
        zIndex?: number;
    }> & Readonly<{
        "onItem-click"?: ((payload: {
            item: import(".").MenuItem;
            originalEvent: MouseEvent;
        }) => any) | undefined;
    }>, {
        close: () => void;
        openIndex: import("vue").Ref<number, number>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "item-click": (payload: {
            item: import(".").MenuItem;
            originalEvent: MouseEvent;
        }) => any;
    }, string, {
        size: "sm" | "md" | "lg";
        zIndex: number;
        trigger: "hover" | "click";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            start?: () => unknown;
            end?: () => unknown;
            item?: (props: {
                item: import(".").MenuItem;
                depth: number;
                branch: boolean;
            }) => unknown;
            panel?: (props: {
                item: import(".").MenuItem;
                depth: number;
                close: () => void;
            }) => unknown;
        };
    });
    TieredMenu: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            items?: import(".").MenuItem[];
            popup?: boolean;
            side?: import(".").AnchorSide;
            align?: import(".").AnchorAlign;
            gap?: number;
            width?: string;
            background?: string;
            borderColor?: string;
            radius?: string;
            textColor?: string;
            hoverBackground?: string;
            hoverTextColor?: string;
            iconColor?: string;
            headerColor?: string;
            hintColor?: string;
            separatorColor?: string;
            padding?: string;
            rowRadius?: string;
            zIndex?: number;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
        }>, {
            show: (event?: unknown, target?: unknown) => void;
            hide: () => void;
            toggle: (event?: unknown, target?: unknown) => void;
            visible: import("vue").Ref<boolean, boolean>;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "item-click": (payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => void;
            show: () => void;
            hide: () => void;
        }, import("vue").PublicProps, {
            side: import(".").AnchorSide;
            zIndex: number;
            align: import(".").AnchorAlign;
            gap: number;
            width: string;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            items?: import(".").MenuItem[];
            popup?: boolean;
            side?: import(".").AnchorSide;
            align?: import(".").AnchorAlign;
            gap?: number;
            width?: string;
            background?: string;
            borderColor?: string;
            radius?: string;
            textColor?: string;
            hoverBackground?: string;
            hoverTextColor?: string;
            iconColor?: string;
            headerColor?: string;
            hintColor?: string;
            separatorColor?: string;
            padding?: string;
            rowRadius?: string;
            zIndex?: number;
        }> & Readonly<{
            "onItem-click"?: ((payload: {
                item: import(".").MenuItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            onShow?: (() => any) | undefined;
            onHide?: (() => any) | undefined;
        }>, {
            show: (event?: unknown, target?: unknown) => void;
            hide: () => void;
            toggle: (event?: unknown, target?: unknown) => void;
            visible: import("vue").Ref<boolean, boolean>;
        }, {}, {}, {}, {
            side: import(".").AnchorSide;
            zIndex: number;
            align: import(".").AnchorAlign;
            gap: number;
            width: string;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        items?: import(".").MenuItem[];
        popup?: boolean;
        side?: import(".").AnchorSide;
        align?: import(".").AnchorAlign;
        gap?: number;
        width?: string;
        background?: string;
        borderColor?: string;
        radius?: string;
        textColor?: string;
        hoverBackground?: string;
        hoverTextColor?: string;
        iconColor?: string;
        headerColor?: string;
        hintColor?: string;
        separatorColor?: string;
        padding?: string;
        rowRadius?: string;
        zIndex?: number;
    }> & Readonly<{
        "onItem-click"?: ((payload: {
            item: import(".").MenuItem;
            originalEvent: MouseEvent;
        }) => any) | undefined;
        onShow?: (() => any) | undefined;
        onHide?: (() => any) | undefined;
    }>, {
        show: (event?: unknown, target?: unknown) => void;
        hide: () => void;
        toggle: (event?: unknown, target?: unknown) => void;
        visible: import("vue").Ref<boolean, boolean>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "item-click": (payload: {
            item: import(".").MenuItem;
            originalEvent: MouseEvent;
        }) => void;
        show: () => void;
        hide: () => void;
    }, string, {
        side: import(".").AnchorSide;
        zIndex: number;
        align: import(".").AnchorAlign;
        gap: number;
        width: string;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            item?: (props: {
                item: import(".").MenuItem;
                depth: number;
                branch: boolean;
            }) => unknown;
        };
    });
    Message: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            visible?: boolean;
            severity?: import(".").MessageSeverity;
            variant?: "filled" | "outlined" | "simple";
            size?: "sm" | "md" | "lg";
            icon?: string;
            closable?: boolean;
            life?: number;
            showTimer?: boolean;
            blur?: boolean | number | string;
            translucent?: boolean;
            background?: string;
            textColor?: string;
            borderColor?: string;
            iconColor?: string;
            radius?: string;
            padding?: string;
            block?: boolean;
        }> & Readonly<{
            onClose?: (() => any) | undefined;
            "onUpdate:visible"?: ((v: boolean) => any) | undefined;
            "onLife-end"?: (() => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:visible": (v: boolean) => void;
            close: () => void;
            "life-end": () => void;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            visible: boolean;
            variant: "filled" | "outlined" | "simple";
            block: boolean;
            severity: import(".").MessageSeverity;
            closable: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            visible?: boolean;
            severity?: import(".").MessageSeverity;
            variant?: "filled" | "outlined" | "simple";
            size?: "sm" | "md" | "lg";
            icon?: string;
            closable?: boolean;
            life?: number;
            showTimer?: boolean;
            blur?: boolean | number | string;
            translucent?: boolean;
            background?: string;
            textColor?: string;
            borderColor?: string;
            iconColor?: string;
            radius?: string;
            padding?: string;
            block?: boolean;
        }> & Readonly<{
            onClose?: (() => any) | undefined;
            "onUpdate:visible"?: ((v: boolean) => any) | undefined;
            "onLife-end"?: (() => any) | undefined;
        }>, {}, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            visible: boolean;
            variant: "filled" | "outlined" | "simple";
            block: boolean;
            severity: import(".").MessageSeverity;
            closable: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        visible?: boolean;
        severity?: import(".").MessageSeverity;
        variant?: "filled" | "outlined" | "simple";
        size?: "sm" | "md" | "lg";
        icon?: string;
        closable?: boolean;
        life?: number;
        showTimer?: boolean;
        blur?: boolean | number | string;
        translucent?: boolean;
        background?: string;
        textColor?: string;
        borderColor?: string;
        iconColor?: string;
        radius?: string;
        padding?: string;
        block?: boolean;
    }> & Readonly<{
        onClose?: (() => any) | undefined;
        "onUpdate:visible"?: ((v: boolean) => any) | undefined;
        "onLife-end"?: (() => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:visible": (v: boolean) => void;
        close: () => void;
        "life-end": () => void;
    }, string, {
        size: "sm" | "md" | "lg";
        visible: boolean;
        variant: "filled" | "outlined" | "simple";
        block: boolean;
        severity: import(".").MessageSeverity;
        closable: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            icon?: (props: {}) => any;
        } & {
            default?: (props: {}) => any;
        } & {
            actions?: (props: {}) => any;
        };
    });
    Toast: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexOverlayClasses & {
            position?: import(".").ToastPosition;
            mode?: "stacked" | "expanded";
            group?: string;
            max?: number;
            life?: number;
            variant?: "filled" | "outlined" | "simple";
            size?: "sm" | "md" | "lg";
            blur?: boolean | number | string;
            width?: string;
            offset?: string;
            zIndex?: number;
            newestOnTop?: boolean;
        }> & Readonly<{
            onClose?: ((message: import(".").ToastMessage) => any) | undefined;
            "onLife-end"?: ((message: import(".").ToastMessage) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            close: (message: import(".").ToastMessage) => void;
            "life-end": (message: import(".").ToastMessage) => void;
        }, import("vue").PublicProps, {
            size: "sm" | "md" | "lg";
            position: import(".").ToastPosition;
            zIndex: number;
            max: number;
            variant: "filled" | "outlined" | "simple";
            width: string;
            mode: "stacked" | "expanded";
            offset: string;
            newestOnTop: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexOverlayClasses & {
            position?: import(".").ToastPosition;
            mode?: "stacked" | "expanded";
            group?: string;
            max?: number;
            life?: number;
            variant?: "filled" | "outlined" | "simple";
            size?: "sm" | "md" | "lg";
            blur?: boolean | number | string;
            width?: string;
            offset?: string;
            zIndex?: number;
            newestOnTop?: boolean;
        }> & Readonly<{
            onClose?: ((message: import(".").ToastMessage) => any) | undefined;
            "onLife-end"?: ((message: import(".").ToastMessage) => any) | undefined;
        }>, {}, {}, {}, {}, {
            size: "sm" | "md" | "lg";
            position: import(".").ToastPosition;
            zIndex: number;
            max: number;
            variant: "filled" | "outlined" | "simple";
            width: string;
            mode: "stacked" | "expanded";
            offset: string;
            newestOnTop: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexOverlayClasses & {
        position?: import(".").ToastPosition;
        mode?: "stacked" | "expanded";
        group?: string;
        max?: number;
        life?: number;
        variant?: "filled" | "outlined" | "simple";
        size?: "sm" | "md" | "lg";
        blur?: boolean | number | string;
        width?: string;
        offset?: string;
        zIndex?: number;
        newestOnTop?: boolean;
    }> & Readonly<{
        onClose?: ((message: import(".").ToastMessage) => any) | undefined;
        "onLife-end"?: ((message: import(".").ToastMessage) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        close: (message: import(".").ToastMessage) => void;
        "life-end": (message: import(".").ToastMessage) => void;
    }, string, {
        size: "sm" | "md" | "lg";
        position: import(".").ToastPosition;
        zIndex: number;
        max: number;
        variant: "filled" | "outlined" | "simple";
        width: string;
        mode: "stacked" | "expanded";
        offset: string;
        newestOnTop: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            message?: (props: {
                message: import(".").ToastMessage;
                close: () => void;
                index: number;
            }) => unknown;
            actions?: (props: {
                message: import(".").ToastMessage;
                close: () => void;
            }) => unknown;
        };
    });
    Carousel: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexMediaProps & {
            slide?: number;
            align?: "start" | "center" | "end";
            slidesPerPage?: number;
            orientation?: "horizontal" | "vertical";
            loop?: boolean;
            autoSize?: boolean;
            gap?: string;
            indicators?: boolean;
            indicatorPosition?: "left" | "center" | "right";
            navPosition?: "bottom" | "top" | "middle" | "both-start" | "both-end" | "split";
        }> & Readonly<{
            "onUpdate:slide"?: ((v: number) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "update:slide": (v: number) => any;
        }, import("vue").PublicProps, {
            slide: number;
            align: "start" | "center" | "end";
            orientation: "horizontal" | "vertical";
            gap: string;
            slidesPerPage: number;
            indicators: boolean;
            indicatorPosition: "left" | "center" | "right";
            navPosition: "bottom" | "top" | "middle" | "both-start" | "both-end" | "split";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexMediaProps & {
            slide?: number;
            align?: "start" | "center" | "end";
            slidesPerPage?: number;
            orientation?: "horizontal" | "vertical";
            loop?: boolean;
            autoSize?: boolean;
            gap?: string;
            indicators?: boolean;
            indicatorPosition?: "left" | "center" | "right";
            navPosition?: "bottom" | "top" | "middle" | "both-start" | "both-end" | "split";
        }> & Readonly<{
            "onUpdate:slide"?: ((v: number) => any) | undefined;
        }>, {}, {}, {}, {}, {
            slide: number;
            align: "start" | "center" | "end";
            orientation: "horizontal" | "vertical";
            gap: string;
            slidesPerPage: number;
            indicators: boolean;
            indicatorPosition: "left" | "center" | "right";
            navPosition: "bottom" | "top" | "middle" | "both-start" | "both-end" | "split";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexMediaProps & {
        slide?: number;
        align?: "start" | "center" | "end";
        slidesPerPage?: number;
        orientation?: "horizontal" | "vertical";
        loop?: boolean;
        autoSize?: boolean;
        gap?: string;
        indicators?: boolean;
        indicatorPosition?: "left" | "center" | "right";
        navPosition?: "bottom" | "top" | "middle" | "both-start" | "both-end" | "split";
    }> & Readonly<{
        "onUpdate:slide"?: ((v: number) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "update:slide": (v: number) => any;
    }, string, {
        slide: number;
        align: "start" | "center" | "end";
        orientation: "horizontal" | "vertical";
        gap: string;
        slidesPerPage: number;
        indicators: boolean;
        indicatorPosition: "left" | "center" | "right";
        navPosition: "bottom" | "top" | "middle" | "both-start" | "both-end" | "split";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    CarouselContent: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {}, true, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, {}>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {}, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    CarouselItem: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {}, true, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, {}>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{}> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {}, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    CarouselNav: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            dir?: "prev" | "next";
            icon?: string;
            size?: number;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            size: number;
            dir: "prev" | "next";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            dir?: "prev" | "next";
            icon?: string;
            size?: number;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            size: number;
            dir: "prev" | "next";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        dir?: "prev" | "next";
        icon?: string;
        size?: number;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        size: number;
        dir: "prev" | "next";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    CarouselControls: import("vue").DefineComponent<{
        variant?: "bar" | "dot";
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{
        variant?: "bar" | "dot";
    }> & Readonly<{}>, {
        variant: "bar" | "dot";
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    CarouselIndicators: import("vue").DefineComponent<{
        variant?: "bar" | "dot";
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{
        variant?: "bar" | "dot";
    }> & Readonly<{}>, {
        variant: "bar" | "dot";
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Compare: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexMediaProps & {
            modelValue?: number;
            orientation?: "horizontal" | "vertical";
            slideOnHover?: boolean;
            disabled?: boolean;
            step?: number;
            pageStep?: number;
            width?: string;
            height?: string;
            aspectRatio?: string;
            radius?: string;
            background?: string;
            dividerWidth?: string;
            dividerColor?: string;
            handle?: boolean;
            handleSize?: string;
            handleColor?: string;
            handleBackground?: string;
            handleBorderColor?: string;
            handleRadius?: string;
            handleShadow?: string;
            icon?: string;
        }> & Readonly<{
            "onUpdate:modelValue"?: ((v: number) => any) | undefined;
            "onSlide-start"?: (() => any) | undefined;
            "onSlide-end"?: (() => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
            "update:modelValue": (v: number) => void;
            "slide-start": () => void;
            "slide-end": () => void;
        }, import("vue").PublicProps, {
            radius: string;
            modelValue: number;
            step: number;
            orientation: "horizontal" | "vertical";
            handleSize: string;
            handle: boolean;
            pageStep: number;
            dividerWidth: string;
            handleRadius: string;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexMediaProps & {
            modelValue?: number;
            orientation?: "horizontal" | "vertical";
            slideOnHover?: boolean;
            disabled?: boolean;
            step?: number;
            pageStep?: number;
            width?: string;
            height?: string;
            aspectRatio?: string;
            radius?: string;
            background?: string;
            dividerWidth?: string;
            dividerColor?: string;
            handle?: boolean;
            handleSize?: string;
            handleColor?: string;
            handleBackground?: string;
            handleBorderColor?: string;
            handleRadius?: string;
            handleShadow?: string;
            icon?: string;
        }> & Readonly<{
            "onUpdate:modelValue"?: ((v: number) => any) | undefined;
            "onSlide-start"?: (() => any) | undefined;
            "onSlide-end"?: (() => any) | undefined;
        }>, {}, {}, {}, {}, {
            radius: string;
            modelValue: number;
            step: number;
            orientation: "horizontal" | "vertical";
            handleSize: string;
            handle: boolean;
            pageStep: number;
            dividerWidth: string;
            handleRadius: string;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexMediaProps & {
        modelValue?: number;
        orientation?: "horizontal" | "vertical";
        slideOnHover?: boolean;
        disabled?: boolean;
        step?: number;
        pageStep?: number;
        width?: string;
        height?: string;
        aspectRatio?: string;
        radius?: string;
        background?: string;
        dividerWidth?: string;
        dividerColor?: string;
        handle?: boolean;
        handleSize?: string;
        handleColor?: string;
        handleBackground?: string;
        handleBorderColor?: string;
        handleRadius?: string;
        handleShadow?: string;
        icon?: string;
    }> & Readonly<{
        "onUpdate:modelValue"?: ((v: number) => any) | undefined;
        "onSlide-start"?: (() => any) | undefined;
        "onSlide-end"?: (() => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
        "update:modelValue": (v: number) => void;
        "slide-start": () => void;
        "slide-end": () => void;
    }, string, {
        radius: string;
        modelValue: number;
        step: number;
        orientation: "horizontal" | "vertical";
        handleSize: string;
        handle: boolean;
        pageStep: number;
        dividerWidth: string;
        handleRadius: string;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        } & {
            handle?: (props: {
                value: number;
            }) => any;
        };
    });
    Gallery: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexMediaProps & {
            images?: import(".").GalleryImage[];
            modelValue?: number;
            open?: boolean;
            overlay?: boolean;
            actions?: import(".").GalleryAction[];
            rotateLeft?: boolean;
            rotateRight?: boolean;
            zoomIn?: boolean;
            zoomOut?: boolean;
            zoomReset?: boolean;
            flipHorizontal?: boolean;
            flipVertical?: boolean;
            downloadable?: boolean;
            fullscreen?: boolean;
            closable?: boolean;
            hoverToolbar?: boolean;
            showNav?: boolean;
            hoverNav?: boolean;
            showThumbnails?: boolean;
            thumbnailsPosition?: "bottom" | "top";
            showCounter?: boolean;
            loop?: boolean;
            zoomStep?: number;
            maxZoom?: number;
            width?: string;
            height?: string;
            aspectRatio?: string;
            radius?: string;
            stageBackground?: string;
            padding?: string;
            toolbarBackground?: string;
            toolbarColor?: string;
            toolbarRadius?: string;
            toolbarPosition?: "top" | "bottom";
            navBackground?: string;
            navColor?: string;
            navSize?: string;
            navRadius?: string;
            thumbSize?: string;
            thumbGap?: string;
            thumbRadius?: string;
            thumbActiveColor?: string;
            thumbInactiveOpacity?: number;
        }> & Readonly<{
            onChange?: ((v: number) => any) | undefined;
            "onUpdate:modelValue"?: ((v: number) => any) | undefined;
            "onUpdate:open"?: ((v: boolean) => any) | undefined;
        }>, {
            act: (a: import(".").GalleryAction) => void;
            go: (i: number) => void;
            reset: () => void;
            zoom: import("vue").Ref<number, number>;
            rotation: import("vue").Ref<number, number>;
            fullscreen: import("vue").Ref<boolean, boolean>;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            change: (v: number) => any;
            "update:modelValue": (v: number) => any;
            "update:open": (v: boolean) => any;
        }, import("vue").PublicProps, {
            radius: string;
            modelValue: number;
            open: boolean;
            fullscreen: boolean;
            actions: import(".").GalleryAction[];
            closable: boolean;
            showNav: boolean;
            zoomIn: boolean;
            zoomOut: boolean;
            rotateLeft: boolean;
            rotateRight: boolean;
            zoomReset: boolean;
            flipHorizontal: boolean;
            flipVertical: boolean;
            downloadable: boolean;
            showThumbnails: boolean;
            thumbnailsPosition: "bottom" | "top";
            showCounter: boolean;
            zoomStep: number;
            maxZoom: number;
            toolbarPosition: "top" | "bottom";
            thumbSize: string;
            thumbGap: string;
            thumbInactiveOpacity: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexMediaProps & {
            images?: import(".").GalleryImage[];
            modelValue?: number;
            open?: boolean;
            overlay?: boolean;
            actions?: import(".").GalleryAction[];
            rotateLeft?: boolean;
            rotateRight?: boolean;
            zoomIn?: boolean;
            zoomOut?: boolean;
            zoomReset?: boolean;
            flipHorizontal?: boolean;
            flipVertical?: boolean;
            downloadable?: boolean;
            fullscreen?: boolean;
            closable?: boolean;
            hoverToolbar?: boolean;
            showNav?: boolean;
            hoverNav?: boolean;
            showThumbnails?: boolean;
            thumbnailsPosition?: "bottom" | "top";
            showCounter?: boolean;
            loop?: boolean;
            zoomStep?: number;
            maxZoom?: number;
            width?: string;
            height?: string;
            aspectRatio?: string;
            radius?: string;
            stageBackground?: string;
            padding?: string;
            toolbarBackground?: string;
            toolbarColor?: string;
            toolbarRadius?: string;
            toolbarPosition?: "top" | "bottom";
            navBackground?: string;
            navColor?: string;
            navSize?: string;
            navRadius?: string;
            thumbSize?: string;
            thumbGap?: string;
            thumbRadius?: string;
            thumbActiveColor?: string;
            thumbInactiveOpacity?: number;
        }> & Readonly<{
            onChange?: ((v: number) => any) | undefined;
            "onUpdate:modelValue"?: ((v: number) => any) | undefined;
            "onUpdate:open"?: ((v: boolean) => any) | undefined;
        }>, {
            act: (a: import(".").GalleryAction) => void;
            go: (i: number) => void;
            reset: () => void;
            zoom: import("vue").Ref<number, number>;
            rotation: import("vue").Ref<number, number>;
            fullscreen: import("vue").Ref<boolean, boolean>;
        }, {}, {}, {}, {
            radius: string;
            modelValue: number;
            open: boolean;
            fullscreen: boolean;
            actions: import(".").GalleryAction[];
            closable: boolean;
            showNav: boolean;
            zoomIn: boolean;
            zoomOut: boolean;
            rotateLeft: boolean;
            rotateRight: boolean;
            zoomReset: boolean;
            flipHorizontal: boolean;
            flipVertical: boolean;
            downloadable: boolean;
            showThumbnails: boolean;
            thumbnailsPosition: "bottom" | "top";
            showCounter: boolean;
            zoomStep: number;
            maxZoom: number;
            toolbarPosition: "top" | "bottom";
            thumbSize: string;
            thumbGap: string;
            thumbInactiveOpacity: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexMediaProps & {
        images?: import(".").GalleryImage[];
        modelValue?: number;
        open?: boolean;
        overlay?: boolean;
        actions?: import(".").GalleryAction[];
        rotateLeft?: boolean;
        rotateRight?: boolean;
        zoomIn?: boolean;
        zoomOut?: boolean;
        zoomReset?: boolean;
        flipHorizontal?: boolean;
        flipVertical?: boolean;
        downloadable?: boolean;
        fullscreen?: boolean;
        closable?: boolean;
        hoverToolbar?: boolean;
        showNav?: boolean;
        hoverNav?: boolean;
        showThumbnails?: boolean;
        thumbnailsPosition?: "bottom" | "top";
        showCounter?: boolean;
        loop?: boolean;
        zoomStep?: number;
        maxZoom?: number;
        width?: string;
        height?: string;
        aspectRatio?: string;
        radius?: string;
        stageBackground?: string;
        padding?: string;
        toolbarBackground?: string;
        toolbarColor?: string;
        toolbarRadius?: string;
        toolbarPosition?: "top" | "bottom";
        navBackground?: string;
        navColor?: string;
        navSize?: string;
        navRadius?: string;
        thumbSize?: string;
        thumbGap?: string;
        thumbRadius?: string;
        thumbActiveColor?: string;
        thumbInactiveOpacity?: number;
    }> & Readonly<{
        onChange?: ((v: number) => any) | undefined;
        "onUpdate:modelValue"?: ((v: number) => any) | undefined;
        "onUpdate:open"?: ((v: boolean) => any) | undefined;
    }>, {
        act: (a: import(".").GalleryAction) => void;
        go: (i: number) => void;
        reset: () => void;
        zoom: import("vue").Ref<number, number>;
        rotation: import("vue").Ref<number, number>;
        fullscreen: import("vue").Ref<boolean, boolean>;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        change: (v: number) => any;
        "update:modelValue": (v: number) => any;
        "update:open": (v: boolean) => any;
    }, string, {
        radius: string;
        modelValue: number;
        open: boolean;
        fullscreen: boolean;
        actions: import(".").GalleryAction[];
        closable: boolean;
        showNav: boolean;
        zoomIn: boolean;
        zoomOut: boolean;
        rotateLeft: boolean;
        rotateRight: boolean;
        zoomReset: boolean;
        flipHorizontal: boolean;
        flipVertical: boolean;
        downloadable: boolean;
        showThumbnails: boolean;
        thumbnailsPosition: "bottom" | "top";
        showCounter: boolean;
        zoomStep: number;
        maxZoom: number;
        toolbarPosition: "top" | "bottom";
        thumbSize: string;
        thumbGap: string;
        thumbInactiveOpacity: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            toolbar?: (props: {
                act: (a: import(".").GalleryAction) => void;
            }) => any;
        } & {
            image?: (props: {
                style: {
                    transform: string;
                };
                image: import(".").GalleryImage;
                index: number;
            }) => any;
        };
    });
    CompareItem: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexMediaProps & {
            position?: "before" | "after";
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            position: "before" | "after";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexMediaProps & {
            position?: "before" | "after";
        }> & Readonly<{}>, {}, {}, {}, {}, {
            position: "before" | "after";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexMediaProps & {
        position?: "before" | "after";
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        position: "before" | "after";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    Sidebar: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            id?: string;
            open?: boolean;
            variant?: "sidebar" | "floating" | "inset";
            collapsible?: "icon" | "offcanvas" | "none";
            side?: "left" | "right";
            overlay?: boolean;
            openOnHover?: boolean;
            backdrop?: boolean;
            width?: string;
            iconWidth?: string;
            background?: string;
            borderColor?: string;
            textColor?: string;
            zIndex?: number;
        }> & Readonly<{
            "onUpdate:open"?: ((v: boolean) => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "update:open": (v: boolean) => any;
        }, import("vue").PublicProps, {
            id: string;
            side: "left" | "right";
            zIndex: number;
            open: boolean;
            variant: "sidebar" | "floating" | "inset";
            width: string;
            collapsible: "icon" | "offcanvas" | "none";
            iconWidth: string;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            id?: string;
            open?: boolean;
            variant?: "sidebar" | "floating" | "inset";
            collapsible?: "icon" | "offcanvas" | "none";
            side?: "left" | "right";
            overlay?: boolean;
            openOnHover?: boolean;
            backdrop?: boolean;
            width?: string;
            iconWidth?: string;
            background?: string;
            borderColor?: string;
            textColor?: string;
            zIndex?: number;
        }> & Readonly<{
            "onUpdate:open"?: ((v: boolean) => any) | undefined;
        }>, {}, {}, {}, {}, {
            id: string;
            side: "left" | "right";
            zIndex: number;
            open: boolean;
            variant: "sidebar" | "floating" | "inset";
            width: string;
            collapsible: "icon" | "offcanvas" | "none";
            iconWidth: string;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        id?: string;
        open?: boolean;
        variant?: "sidebar" | "floating" | "inset";
        collapsible?: "icon" | "offcanvas" | "none";
        side?: "left" | "right";
        overlay?: boolean;
        openOnHover?: boolean;
        backdrop?: boolean;
        width?: string;
        iconWidth?: string;
        background?: string;
        borderColor?: string;
        textColor?: string;
        zIndex?: number;
    }> & Readonly<{
        "onUpdate:open"?: ((v: boolean) => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "update:open": (v: boolean) => any;
    }, string, {
        id: string;
        side: "left" | "right";
        zIndex: number;
        open: boolean;
        variant: "sidebar" | "floating" | "inset";
        width: string;
        collapsible: "icon" | "offcanvas" | "none";
        iconWidth: string;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            header?: (props: {
                collapsed: boolean;
            }) => any;
        } & {
            default?: (props: {
                collapsed: boolean;
            }) => any;
        } & {
            footer?: (props: {
                collapsed: boolean;
            }) => any;
        };
    });
    SidebarLayout: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            variant?: "plain" | "inset";
            height?: string;
            background?: string;
            radius?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            variant: "plain" | "inset";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            variant?: "plain" | "inset";
            height?: string;
            background?: string;
            radius?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            variant: "plain" | "inset";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        variant?: "plain" | "inset";
        height?: string;
        background?: string;
        radius?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        variant: "plain" | "inset";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    SidebarInset: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            scroll?: boolean;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {}, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            scroll?: boolean;
        }> & Readonly<{}>, {}, {}, {}, {}, {}>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        scroll?: boolean;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {}, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    SidebarTrigger: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            target?: string;
            icon?: string;
            label?: string;
            size?: number;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            size: number;
            label: string;
            target: string;
            icon: string;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            target?: string;
            icon?: string;
            label?: string;
            size?: number;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            size: number;
            label: string;
            target: string;
            icon: string;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        target?: string;
        icon?: string;
        label?: string;
        size?: number;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        size: number;
        label: string;
        target: string;
        icon: string;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    ProgressBar: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            ui?: import("./types").ApexProgressBarClasses;
            value?: number;
            max?: number;
            mode?: "determinate" | "indeterminate";
            indeterminate?: boolean;
            steps?: string[];
            step?: number;
            showStepLabel?: boolean;
            showValue?: boolean;
            valuePosition?: "inside" | "end";
            insideThreshold?: number;
            height?: number | string;
            color?: string;
            trackColor?: string;
            radius?: string;
            fillRadius?: string;
            valueColor?: string;
            valueSize?: string;
            striped?: boolean;
            animatedStripes?: boolean;
            sweepDuration?: string;
            severity?: "primary" | "success" | "warning" | "danger" | "auto";
            label?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            value: number;
            max: number;
            step: number;
            height: number | string;
            severity: "primary" | "success" | "warning" | "danger" | "auto";
            showStepLabel: boolean;
            valuePosition: "inside" | "end";
            insideThreshold: number;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            ui?: import("./types").ApexProgressBarClasses;
            value?: number;
            max?: number;
            mode?: "determinate" | "indeterminate";
            indeterminate?: boolean;
            steps?: string[];
            step?: number;
            showStepLabel?: boolean;
            showValue?: boolean;
            valuePosition?: "inside" | "end";
            insideThreshold?: number;
            height?: number | string;
            color?: string;
            trackColor?: string;
            radius?: string;
            fillRadius?: string;
            valueColor?: string;
            valueSize?: string;
            striped?: boolean;
            animatedStripes?: boolean;
            sweepDuration?: string;
            severity?: "primary" | "success" | "warning" | "danger" | "auto";
            label?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            value: number;
            max: number;
            step: number;
            height: number | string;
            severity: "primary" | "success" | "warning" | "danger" | "auto";
            showStepLabel: boolean;
            valuePosition: "inside" | "end";
            insideThreshold: number;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        ui?: import("./types").ApexProgressBarClasses;
        value?: number;
        max?: number;
        mode?: "determinate" | "indeterminate";
        indeterminate?: boolean;
        steps?: string[];
        step?: number;
        showStepLabel?: boolean;
        showValue?: boolean;
        valuePosition?: "inside" | "end";
        insideThreshold?: number;
        height?: number | string;
        color?: string;
        trackColor?: string;
        radius?: string;
        fillRadius?: string;
        valueColor?: string;
        valueSize?: string;
        striped?: boolean;
        animatedStripes?: boolean;
        sweepDuration?: string;
        severity?: "primary" | "success" | "warning" | "danger" | "auto";
        label?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        value: number;
        max: number;
        step: number;
        height: number | string;
        severity: "primary" | "success" | "warning" | "danger" | "auto";
        showStepLabel: boolean;
        valuePosition: "inside" | "end";
        insideThreshold: number;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            label?: (props: {
                value: number;
                percent: number;
                formatted: string;
                step: string;
            }) => unknown;
            value?: (props: {
                value: number;
                percent: number;
                formatted: string;
            }) => unknown;
        };
    });
    ProgressSpinner: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            value?: number;
            max?: number;
            size?: number | string;
            strokeWidth?: number;
            color?: string;
            trackColor?: string;
            showTrack?: boolean;
            showValue?: boolean;
            valueColor?: string;
            valueSize?: string;
            duration?: string;
            arc?: number;
            linecap?: "round" | "butt";
            pulse?: boolean;
            severity?: "primary" | "success" | "warning" | "danger" | "auto";
            label?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, import("vue").PublicProps, {
            size: number | string;
            max: number;
            strokeWidth: number;
            arc: number;
            severity: "primary" | "success" | "warning" | "danger" | "auto";
            duration: string;
            showTrack: boolean;
            linecap: "round" | "butt";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            value?: number;
            max?: number;
            size?: number | string;
            strokeWidth?: number;
            color?: string;
            trackColor?: string;
            showTrack?: boolean;
            showValue?: boolean;
            valueColor?: string;
            valueSize?: string;
            duration?: string;
            arc?: number;
            linecap?: "round" | "butt";
            pulse?: boolean;
            severity?: "primary" | "success" | "warning" | "danger" | "auto";
            label?: string;
        }> & Readonly<{}>, {}, {}, {}, {}, {
            size: number | string;
            max: number;
            strokeWidth: number;
            arc: number;
            severity: "primary" | "success" | "warning" | "danger" | "auto";
            duration: string;
            showTrack: boolean;
            linecap: "round" | "butt";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        value?: number;
        max?: number;
        size?: number | string;
        strokeWidth?: number;
        color?: string;
        trackColor?: string;
        showTrack?: boolean;
        showValue?: boolean;
        valueColor?: string;
        valueSize?: string;
        duration?: string;
        arc?: number;
        linecap?: "round" | "butt";
        pulse?: boolean;
        severity?: "primary" | "success" | "warning" | "danger" | "auto";
        label?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, {
        size: number | string;
        max: number;
        strokeWidth: number;
        arc: number;
        severity: "primary" | "success" | "warning" | "danger" | "auto";
        duration: string;
        showTrack: boolean;
        linecap: "round" | "butt";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {
                value: number | undefined;
                percent: number;
                formatted: string;
            }) => any;
        };
    });
    ScrollTop: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            target?: "window" | "parent" | string;
            threshold?: number;
            icon?: string;
            label?: string;
            ariaLabel?: string;
            behavior?: "smooth" | "auto";
            position?: "bottom-end" | "bottom-start" | "bottom-center";
            offset?: string;
            size?: string;
            radius?: string;
            background?: string;
            color?: string;
            borderColor?: string;
            shadow?: string;
            hoverBackground?: string;
            hoverColor?: string;
            hoverLift?: boolean;
            showProgress?: boolean;
            progressColor?: string;
            zIndex?: number;
        }> & Readonly<{
            onClick?: (() => any) | undefined;
        }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            click: () => any;
        }, import("vue").PublicProps, {
            size: string;
            position: "bottom-end" | "bottom-start" | "bottom-center";
            zIndex: number;
            target: "window" | "parent" | string;
            icon: string;
            offset: string;
            behavior: "smooth" | "auto";
            threshold: number;
            hoverLift: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            target?: "window" | "parent" | string;
            threshold?: number;
            icon?: string;
            label?: string;
            ariaLabel?: string;
            behavior?: "smooth" | "auto";
            position?: "bottom-end" | "bottom-start" | "bottom-center";
            offset?: string;
            size?: string;
            radius?: string;
            background?: string;
            color?: string;
            borderColor?: string;
            shadow?: string;
            hoverBackground?: string;
            hoverColor?: string;
            hoverLift?: boolean;
            showProgress?: boolean;
            progressColor?: string;
            zIndex?: number;
        }> & Readonly<{
            onClick?: (() => any) | undefined;
        }>, {}, {}, {}, {}, {
            size: string;
            position: "bottom-end" | "bottom-start" | "bottom-center";
            zIndex: number;
            target: "window" | "parent" | string;
            icon: string;
            offset: string;
            behavior: "smooth" | "auto";
            threshold: number;
            hoverLift: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        target?: "window" | "parent" | string;
        threshold?: number;
        icon?: string;
        label?: string;
        ariaLabel?: string;
        behavior?: "smooth" | "auto";
        position?: "bottom-end" | "bottom-start" | "bottom-center";
        offset?: string;
        size?: string;
        radius?: string;
        background?: string;
        color?: string;
        borderColor?: string;
        shadow?: string;
        hoverBackground?: string;
        hoverColor?: string;
        hoverLift?: boolean;
        showProgress?: boolean;
        progressColor?: string;
        zIndex?: number;
    }> & Readonly<{
        onClick?: (() => any) | undefined;
    }>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        click: () => any;
    }, string, {
        size: string;
        position: "bottom-end" | "bottom-start" | "bottom-center";
        zIndex: number;
        target: "window" | "parent" | string;
        icon: string;
        offset: string;
        behavior: "smooth" | "auto";
        threshold: number;
        hoverLift: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    Skeleton: import("vue").DefineComponent<{
        shape?: "rectangle" | "rounded" | "square" | "circle" | "text";
        size?: string;
        width?: string;
        height?: string;
        borderRadius?: string;
        background?: string;
        shimmerColor?: string;
        animation?: "wave" | "pulse" | "none";
        duration?: string;
        delay?: string;
        lines?: number;
        lineGap?: string;
        lastLineWidth?: string;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{
        shape?: "rectangle" | "rounded" | "square" | "circle" | "text";
        size?: string;
        width?: string;
        height?: string;
        borderRadius?: string;
        background?: string;
        shimmerColor?: string;
        animation?: "wave" | "pulse" | "none";
        duration?: string;
        delay?: string;
        lines?: number;
        lineGap?: string;
        lastLineWidth?: string;
    }> & Readonly<{}>, {
        shape: "rectangle" | "rounded" | "square" | "circle" | "text";
        duration: string;
        animation: "wave" | "pulse" | "none";
        lines: number;
        lastLineWidth: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    Chart: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexChartProps & {
            series?: import(".").ChartSeries[];
            xAxis?: import(".").AxisSpec;
            yAxis?: import(".").AxisSpec;
            y2Axis?: import(".").AxisSpec;
            title?: string;
            caption?: string;
            legend?: import("./components/ApexChart.vue").ChartLegendSpec;
            tooltip?: import("./components/ApexChart.vue").ChartTooltipSpec;
            hover?: import("./components/ApexChart.vue").ChartHoverSpec;
            curve?: import(".").CurveType;
            tension?: number;
            connectNulls?: "gap" | "connect" | "zero" | boolean;
            stackMode?: import(".").StackMode;
            orientation?: "vertical" | "horizontal";
            categoryGap?: number;
            barGap?: number;
            barPadding?: number;
            barThickness?: number;
            maxBarThickness?: number;
            barMode?: "group" | "overlap";
            overlapRatio?: number;
            barRadius?: number | {
                tl?: number;
                tr?: number;
                br?: number;
                bl?: number;
            };
            barBorderColor?: string;
            barBorderWidth?: number;
            barBorderDash?: number[] | string;
            borderSkipped?: "start" | "end" | "middle" | false;
            minBarLength?: number;
            innerRadius?: number;
            padAngle?: number;
            startAngle?: number;
            endAngle?: number;
            outerRadius?: number;
            radarRings?: number;
            centerLabel?: string;
            centerValue?: string;
            dataLabels?: boolean | import("./components/ApexChart.vue").ChartDataLabelSpec;
            zoom?: boolean | import("./components/ApexChart.vue").ChartZoomSpec;
            zoomRange?: import(".").ZoomRange | import("./core/chart/viewport").ZoomWindow | null;
            navigator?: boolean | import("./components/ApexChart.vue").ChartNavigatorSpec;
            referenceLines?: import("./components/ApexChart.vue").ChartReferenceLine[];
            referenceBands?: import("./components/ApexChart.vue").ChartReferenceBand[];
            plugins?: import(".").ChartPlugin[];
            toolbar?: boolean | {
                items?: ("png" | "svg" | "csv" | "reset-zoom")[];
            };
            referenceLabelPosition?: "start" | "end";
            showMarkers?: boolean;
            markerSize?: number;
            markerShape?: import(".").MarkerShape;
            panes?: {
                id: string;
                weight?: number;
                label?: string;
            }[];
            paneGap?: number;
            neutralColor?: string;
            barWidthRatio?: number;
            wickStrokeWidth?: number;
            pointBorderColor?: string;
            pointBorderStrokeWidth?: number;
            lineStrokeWidth?: number;
            pointHitRadius?: number;
            height?: string | number;
            renderer?: "svg" | "canvas" | "auto";
            decimation?: boolean | number;
            decimationThreshold?: number;
            animation?: boolean;
            animationDuration?: number;
            entrance?: "auto" | "draw" | "sweep" | "scale" | "grow" | "none";
            entranceDuration?: number;
            entranceOnVisible?: boolean;
            entranceDirection?: "cw" | "ccw";
            dataTable?: boolean;
            ariaLabel?: string;
            locale?: string;
            direction?: "ltr" | "rtl" | "auto";
            responsive?: {
                maxWidth: number;
                [key: string]: unknown;
            }[];
        }> & Readonly<{
            "onPoint-click"?: ((payload: {
                series: string;
                point: import(".").ChartPoint;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onHover-change"?: ((payload: import(".").HitResult | null) => any) | undefined;
            "onLegend-toggle"?: ((payload: {
                series: string;
                hidden: boolean;
            }) => any) | undefined;
            "onUpdate:zoomRange"?: ((payload: import(".").ZoomRange | import("./core/chart/viewport").ZoomWindow | null) => any) | undefined;
            "onZoom-change"?: ((payload: {
                range: import(".").ZoomRange | null;
                full: boolean;
            }) => any) | undefined;
        }>, {
            geometry: () => {
                plot: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                };
                scales: {
                    x: import(".").Scale;
                    left: import(".").Scale;
                    right: import(".").Scale | null;
                    paneY?: import(".").Scale[];
                } | undefined;
            };
            clearHover: () => void;
            exportSvg: () => string;
            exportImage: (options?: import("./core/chart/export").RasterOptions) => Promise<Blob>;
            exportCsv: () => string;
            exportRows: () => Record<string, unknown>[];
            zoomTo: (range: import(".").ZoomRange | null) => void;
            resetZoom: () => void;
            zoomRange: () => import(".").ZoomRange | null;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "point-click": (payload: {
                series: string;
                point: import(".").ChartPoint;
                originalEvent: MouseEvent;
            }) => any;
            "hover-change": (payload: import(".").HitResult | null) => any;
            "legend-toggle": (payload: {
                series: string;
                hidden: boolean;
            }) => any;
            "update:zoomRange": (payload: import(".").ZoomRange | import("./core/chart/viewport").ZoomWindow | null) => any;
            "zoom-change": (payload: {
                range: import(".").ZoomRange | null;
                full: boolean;
            }) => any;
        }, import("vue").PublicProps, {
            orientation: "vertical" | "horizontal";
            barRadius: number | {
                tl?: number;
                tr?: number;
                br?: number;
                bl?: number;
            };
            height: string | number;
            direction: "ltr" | "rtl" | "auto";
            markerSize: number;
            animation: boolean;
            animationDuration: number;
            curve: import(".").CurveType;
            tension: number;
            connectNulls: "gap" | "connect" | "zero" | boolean;
            stackMode: import(".").StackMode;
            barGap: number;
            barPadding: number;
            barMode: "group" | "overlap";
            overlapRatio: number;
            borderSkipped: "start" | "end" | "middle" | false;
            innerRadius: number;
            padAngle: number;
            startAngle: number;
            outerRadius: number;
            radarRings: number;
            referenceLabelPosition: "start" | "end";
            markerShape: import(".").MarkerShape;
            paneGap: number;
            barWidthRatio: number;
            wickStrokeWidth: number;
            lineStrokeWidth: number;
            pointHitRadius: number;
            renderer: "svg" | "canvas" | "auto";
            decimation: boolean | number;
            decimationThreshold: number;
            entrance: "auto" | "draw" | "sweep" | "scale" | "grow" | "none";
            entranceDuration: number;
            entranceOnVisible: boolean;
            entranceDirection: "cw" | "ccw";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexChartProps & {
            series?: import(".").ChartSeries[];
            xAxis?: import(".").AxisSpec;
            yAxis?: import(".").AxisSpec;
            y2Axis?: import(".").AxisSpec;
            title?: string;
            caption?: string;
            legend?: import("./components/ApexChart.vue").ChartLegendSpec;
            tooltip?: import("./components/ApexChart.vue").ChartTooltipSpec;
            hover?: import("./components/ApexChart.vue").ChartHoverSpec;
            curve?: import(".").CurveType;
            tension?: number;
            connectNulls?: "gap" | "connect" | "zero" | boolean;
            stackMode?: import(".").StackMode;
            orientation?: "vertical" | "horizontal";
            categoryGap?: number;
            barGap?: number;
            barPadding?: number;
            barThickness?: number;
            maxBarThickness?: number;
            barMode?: "group" | "overlap";
            overlapRatio?: number;
            barRadius?: number | {
                tl?: number;
                tr?: number;
                br?: number;
                bl?: number;
            };
            barBorderColor?: string;
            barBorderWidth?: number;
            barBorderDash?: number[] | string;
            borderSkipped?: "start" | "end" | "middle" | false;
            minBarLength?: number;
            innerRadius?: number;
            padAngle?: number;
            startAngle?: number;
            endAngle?: number;
            outerRadius?: number;
            radarRings?: number;
            centerLabel?: string;
            centerValue?: string;
            dataLabels?: boolean | import("./components/ApexChart.vue").ChartDataLabelSpec;
            zoom?: boolean | import("./components/ApexChart.vue").ChartZoomSpec;
            zoomRange?: import(".").ZoomRange | import("./core/chart/viewport").ZoomWindow | null;
            navigator?: boolean | import("./components/ApexChart.vue").ChartNavigatorSpec;
            referenceLines?: import("./components/ApexChart.vue").ChartReferenceLine[];
            referenceBands?: import("./components/ApexChart.vue").ChartReferenceBand[];
            plugins?: import(".").ChartPlugin[];
            toolbar?: boolean | {
                items?: ("png" | "svg" | "csv" | "reset-zoom")[];
            };
            referenceLabelPosition?: "start" | "end";
            showMarkers?: boolean;
            markerSize?: number;
            markerShape?: import(".").MarkerShape;
            panes?: {
                id: string;
                weight?: number;
                label?: string;
            }[];
            paneGap?: number;
            neutralColor?: string;
            barWidthRatio?: number;
            wickStrokeWidth?: number;
            pointBorderColor?: string;
            pointBorderStrokeWidth?: number;
            lineStrokeWidth?: number;
            pointHitRadius?: number;
            height?: string | number;
            renderer?: "svg" | "canvas" | "auto";
            decimation?: boolean | number;
            decimationThreshold?: number;
            animation?: boolean;
            animationDuration?: number;
            entrance?: "auto" | "draw" | "sweep" | "scale" | "grow" | "none";
            entranceDuration?: number;
            entranceOnVisible?: boolean;
            entranceDirection?: "cw" | "ccw";
            dataTable?: boolean;
            ariaLabel?: string;
            locale?: string;
            direction?: "ltr" | "rtl" | "auto";
            responsive?: {
                maxWidth: number;
                [key: string]: unknown;
            }[];
        }> & Readonly<{
            "onPoint-click"?: ((payload: {
                series: string;
                point: import(".").ChartPoint;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onHover-change"?: ((payload: import(".").HitResult | null) => any) | undefined;
            "onLegend-toggle"?: ((payload: {
                series: string;
                hidden: boolean;
            }) => any) | undefined;
            "onUpdate:zoomRange"?: ((payload: import(".").ZoomRange | import("./core/chart/viewport").ZoomWindow | null) => any) | undefined;
            "onZoom-change"?: ((payload: {
                range: import(".").ZoomRange | null;
                full: boolean;
            }) => any) | undefined;
        }>, {
            geometry: () => {
                plot: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                };
                scales: {
                    x: import(".").Scale;
                    left: import(".").Scale;
                    right: import(".").Scale | null;
                    paneY?: import(".").Scale[];
                } | undefined;
            };
            clearHover: () => void;
            exportSvg: () => string;
            exportImage: (options?: import("./core/chart/export").RasterOptions) => Promise<Blob>;
            exportCsv: () => string;
            exportRows: () => Record<string, unknown>[];
            zoomTo: (range: import(".").ZoomRange | null) => void;
            resetZoom: () => void;
            zoomRange: () => import(".").ZoomRange | null;
        }, {}, {}, {}, {
            orientation: "vertical" | "horizontal";
            barRadius: number | {
                tl?: number;
                tr?: number;
                br?: number;
                bl?: number;
            };
            height: string | number;
            direction: "ltr" | "rtl" | "auto";
            markerSize: number;
            animation: boolean;
            animationDuration: number;
            curve: import(".").CurveType;
            tension: number;
            connectNulls: "gap" | "connect" | "zero" | boolean;
            stackMode: import(".").StackMode;
            barGap: number;
            barPadding: number;
            barMode: "group" | "overlap";
            overlapRatio: number;
            borderSkipped: "start" | "end" | "middle" | false;
            innerRadius: number;
            padAngle: number;
            startAngle: number;
            outerRadius: number;
            radarRings: number;
            referenceLabelPosition: "start" | "end";
            markerShape: import(".").MarkerShape;
            paneGap: number;
            barWidthRatio: number;
            wickStrokeWidth: number;
            lineStrokeWidth: number;
            pointHitRadius: number;
            renderer: "svg" | "canvas" | "auto";
            decimation: boolean | number;
            decimationThreshold: number;
            entrance: "auto" | "draw" | "sweep" | "scale" | "grow" | "none";
            entranceDuration: number;
            entranceOnVisible: boolean;
            entranceDirection: "cw" | "ccw";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexChartProps & {
        series?: import(".").ChartSeries[];
        xAxis?: import(".").AxisSpec;
        yAxis?: import(".").AxisSpec;
        y2Axis?: import(".").AxisSpec;
        title?: string;
        caption?: string;
        legend?: import("./components/ApexChart.vue").ChartLegendSpec;
        tooltip?: import("./components/ApexChart.vue").ChartTooltipSpec;
        hover?: import("./components/ApexChart.vue").ChartHoverSpec;
        curve?: import(".").CurveType;
        tension?: number;
        connectNulls?: "gap" | "connect" | "zero" | boolean;
        stackMode?: import(".").StackMode;
        orientation?: "vertical" | "horizontal";
        categoryGap?: number;
        barGap?: number;
        barPadding?: number;
        barThickness?: number;
        maxBarThickness?: number;
        barMode?: "group" | "overlap";
        overlapRatio?: number;
        barRadius?: number | {
            tl?: number;
            tr?: number;
            br?: number;
            bl?: number;
        };
        barBorderColor?: string;
        barBorderWidth?: number;
        barBorderDash?: number[] | string;
        borderSkipped?: "start" | "end" | "middle" | false;
        minBarLength?: number;
        innerRadius?: number;
        padAngle?: number;
        startAngle?: number;
        endAngle?: number;
        outerRadius?: number;
        radarRings?: number;
        centerLabel?: string;
        centerValue?: string;
        dataLabels?: boolean | import("./components/ApexChart.vue").ChartDataLabelSpec;
        zoom?: boolean | import("./components/ApexChart.vue").ChartZoomSpec;
        zoomRange?: import(".").ZoomRange | import("./core/chart/viewport").ZoomWindow | null;
        navigator?: boolean | import("./components/ApexChart.vue").ChartNavigatorSpec;
        referenceLines?: import("./components/ApexChart.vue").ChartReferenceLine[];
        referenceBands?: import("./components/ApexChart.vue").ChartReferenceBand[];
        plugins?: import(".").ChartPlugin[];
        toolbar?: boolean | {
            items?: ("png" | "svg" | "csv" | "reset-zoom")[];
        };
        referenceLabelPosition?: "start" | "end";
        showMarkers?: boolean;
        markerSize?: number;
        markerShape?: import(".").MarkerShape;
        panes?: {
            id: string;
            weight?: number;
            label?: string;
        }[];
        paneGap?: number;
        neutralColor?: string;
        barWidthRatio?: number;
        wickStrokeWidth?: number;
        pointBorderColor?: string;
        pointBorderStrokeWidth?: number;
        lineStrokeWidth?: number;
        pointHitRadius?: number;
        height?: string | number;
        renderer?: "svg" | "canvas" | "auto";
        decimation?: boolean | number;
        decimationThreshold?: number;
        animation?: boolean;
        animationDuration?: number;
        entrance?: "auto" | "draw" | "sweep" | "scale" | "grow" | "none";
        entranceDuration?: number;
        entranceOnVisible?: boolean;
        entranceDirection?: "cw" | "ccw";
        dataTable?: boolean;
        ariaLabel?: string;
        locale?: string;
        direction?: "ltr" | "rtl" | "auto";
        responsive?: {
            maxWidth: number;
            [key: string]: unknown;
        }[];
    }> & Readonly<{
        "onPoint-click"?: ((payload: {
            series: string;
            point: import(".").ChartPoint;
            originalEvent: MouseEvent;
        }) => any) | undefined;
        "onHover-change"?: ((payload: import(".").HitResult | null) => any) | undefined;
        "onLegend-toggle"?: ((payload: {
            series: string;
            hidden: boolean;
        }) => any) | undefined;
        "onUpdate:zoomRange"?: ((payload: import(".").ZoomRange | import("./core/chart/viewport").ZoomWindow | null) => any) | undefined;
        "onZoom-change"?: ((payload: {
            range: import(".").ZoomRange | null;
            full: boolean;
        }) => any) | undefined;
    }>, {
        geometry: () => {
            plot: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            scales: {
                x: import(".").Scale;
                left: import(".").Scale;
                right: import(".").Scale | null;
                paneY?: import(".").Scale[];
            } | undefined;
        };
        clearHover: () => void;
        exportSvg: () => string;
        exportImage: (options?: import("./core/chart/export").RasterOptions) => Promise<Blob>;
        exportCsv: () => string;
        exportRows: () => Record<string, unknown>[];
        zoomTo: (range: import(".").ZoomRange | null) => void;
        resetZoom: () => void;
        zoomRange: () => import(".").ZoomRange | null;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "point-click": (payload: {
            series: string;
            point: import(".").ChartPoint;
            originalEvent: MouseEvent;
        }) => any;
        "hover-change": (payload: import(".").HitResult | null) => any;
        "legend-toggle": (payload: {
            series: string;
            hidden: boolean;
        }) => any;
        "update:zoomRange": (payload: import(".").ZoomRange | import("./core/chart/viewport").ZoomWindow | null) => any;
        "zoom-change": (payload: {
            range: import(".").ZoomRange | null;
            full: boolean;
        }) => any;
    }, string, {
        orientation: "vertical" | "horizontal";
        barRadius: number | {
            tl?: number;
            tr?: number;
            br?: number;
            bl?: number;
        };
        height: string | number;
        direction: "ltr" | "rtl" | "auto";
        markerSize: number;
        animation: boolean;
        animationDuration: number;
        curve: import(".").CurveType;
        tension: number;
        connectNulls: "gap" | "connect" | "zero" | boolean;
        stackMode: import(".").StackMode;
        barGap: number;
        barPadding: number;
        barMode: "group" | "overlap";
        overlapRatio: number;
        borderSkipped: "start" | "end" | "middle" | false;
        innerRadius: number;
        padAngle: number;
        startAngle: number;
        outerRadius: number;
        radarRings: number;
        referenceLabelPosition: "start" | "end";
        markerShape: import(".").MarkerShape;
        paneGap: number;
        barWidthRatio: number;
        wickStrokeWidth: number;
        lineStrokeWidth: number;
        pointHitRadius: number;
        renderer: "svg" | "canvas" | "auto";
        decimation: boolean | number;
        decimationThreshold: number;
        entrance: "auto" | "draw" | "sweep" | "scale" | "grow" | "none";
        entranceDuration: number;
        entranceOnVisible: boolean;
        entranceDirection: "cw" | "ccw";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            legend?: (props: {
                series: import(".").ResolvedSeries[];
                colors: string[];
                hidden: string[];
                toggle: (s: import(".").ResolvedSeries) => void;
            }) => any;
        } & {
            annotation?: (props: {
                plot: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                };
                scales: {
                    x: import(".").Scale;
                    left: import(".").Scale;
                    right: import(".").Scale | null;
                    paneY?: import(".").Scale[];
                };
                x: (v: number) => number;
                y: (v: number) => number;
            }) => any;
        } & {
            tooltip?: (props: {
                entries: import("./core/chart/data").HitEntry[];
                category: string;
                rows: {
                    name: string;
                    color: string;
                    value: string;
                    key: string;
                    isOhlc: boolean;
                }[];
                hit: import(".").HitResult;
            }) => any;
        } & {
            legend?: (props: {
                series: import(".").ResolvedSeries[];
                colors: string[];
                hidden: string[];
                toggle: (s: import(".").ResolvedSeries) => void;
            }) => any;
        } & {
            default?: (props: {}) => any;
        };
    });
    ChartGroup: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<{
            zoom?: boolean;
            crosshair?: boolean;
            legend?: boolean;
            syncY?: boolean;
        }> & Readonly<{
            "onZoom-change"?: ((payload: {
                range: import("./core/chart/viewport").ZoomWindow | null;
            }) => any) | undefined;
        }>, {
            state: import(".").ChartGroupState;
            zoomTo: (range: import("./core/chart/viewport").ZoomWindow | null) => void;
            resetZoom: () => void;
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "zoom-change": (payload: {
                range: import("./core/chart/viewport").ZoomWindow | null;
            }) => any;
        }, import("vue").PublicProps, {
            legend: boolean;
            zoom: boolean;
            crosshair: boolean;
            syncY: boolean;
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<{
            zoom?: boolean;
            crosshair?: boolean;
            legend?: boolean;
            syncY?: boolean;
        }> & Readonly<{
            "onZoom-change"?: ((payload: {
                range: import("./core/chart/viewport").ZoomWindow | null;
            }) => any) | undefined;
        }>, {
            state: import(".").ChartGroupState;
            zoomTo: (range: import("./core/chart/viewport").ZoomWindow | null) => void;
            resetZoom: () => void;
        }, {}, {}, {}, {
            legend: boolean;
            zoom: boolean;
            crosshair: boolean;
            syncY: boolean;
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<{
        zoom?: boolean;
        crosshair?: boolean;
        legend?: boolean;
        syncY?: boolean;
    }> & Readonly<{
        "onZoom-change"?: ((payload: {
            range: import("./core/chart/viewport").ZoomWindow | null;
        }) => any) | undefined;
    }>, {
        state: import(".").ChartGroupState;
        zoomTo: (range: import("./core/chart/viewport").ZoomWindow | null) => void;
        resetZoom: () => void;
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "zoom-change": (payload: {
            range: import("./core/chart/viewport").ZoomWindow | null;
        }) => any;
    }, string, {
        legend: boolean;
        zoom: boolean;
        crosshair: boolean;
        syncY: boolean;
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            default?: (props: {}) => any;
        };
    });
    ChartSeries: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartXAxis: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartYAxis: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartY2Axis: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartLegend: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartTooltip: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartHover: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartDataLabels: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartZoom: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartNavigator: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartReferenceLine: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartReferenceBand: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartTitle: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ChartCaption: import("vue").DefineComponent<import("vue").ExtractPropTypes<never>, () => null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<never>> & Readonly<{}>, never, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    TaskBoard: {
        new (...args: any[]): import("vue").CreateComponentPublicInstanceWithMixins<Readonly<import("./types").ApexBoardProps & {
            items?: import(".").TaskBoardItem[];
            columns?: import(".").TaskBoardColumn[];
            swimlanes?: import(".").TaskBoardSwimlane[];
            columnGroups?: import("./core/taskboard").TaskBoardColumnGroup[];
            reorderableColumns?: boolean;
            confirmMove?: (payload: import(".").TaskBoardMove) => boolean | Promise<boolean>;
            permissions?: import("./core/taskboard").TaskBoardPermissions;
            virtualScroll?: boolean;
            virtualScrollItemHeight?: number;
            virtualScrollBuffer?: number;
            cardFields?: import(".").TaskCardFields;
            draggable?: boolean;
            selectionMode?: "none" | "single" | "multiple";
            wipMode?: "warn" | "block";
            showCounts?: boolean;
            showAddCard?: boolean;
            collapsibleColumns?: boolean;
            columnWidth?: string;
            laneWidth?: string;
            gap?: string;
            height?: string;
            density?: "compact" | "normal" | "roomy";
            background?: string;
            columnBackground?: string;
            cardBackground?: string;
            cardRadius?: string;
            accent?: string;
        }> & Readonly<{
            "onColumn-reorder"?: ((payload: {
                columnId: string;
                fromIndex: number;
                toIndex: number;
            }) => any) | undefined;
            "onSelection-change"?: ((payload: {
                items: import(".").TaskBoardItem[];
            }) => any) | undefined;
            "onCard-move"?: ((payload: import(".").TaskBoardMove) => any) | undefined;
            "onCard-click"?: ((payload: {
                item: import(".").TaskBoardItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onCard-activate"?: ((payload: {
                item: import(".").TaskBoardItem;
            }) => any) | undefined;
            "onCard-contextmenu"?: ((payload: {
                item: import(".").TaskBoardItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onAdd-card"?: ((payload: {
                columnId: string;
                swimlaneId?: string;
            }) => any) | undefined;
            "onColumn-collapse"?: ((payload: {
                columnId: string;
                collapsed: boolean;
            }) => any) | undefined;
            "onWip-blocked"?: ((payload: {
                columnId: string;
            }) => any) | undefined;
        }>, {
            clearSelection: () => void;
            selectAll: (columnId: string, swimlaneId?: string) => void;
            getState: () => {
                collapsedColumns: string[];
                closedSwimlanes: string[];
                selection: (string | number)[];
                boardScroll: number;
                cellScroll: Record<string, number>;
            };
            setState: (state: ReturnType<() => {
                collapsedColumns: string[];
                closedSwimlanes: string[];
                selection: (string | number)[];
                boardScroll: number;
                cellScroll: Record<string, number>;
            }> | null | undefined) => void;
            exportJson: () => string;
            exportCsv: () => string;
            exportRows: () => {
                id: string | number;
                title: {};
                column: string;
                swimlane: string;
                order: number;
                priority: {};
                assignees: string;
                labels: string;
                due: {};
            }[];
        }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
            "column-reorder": (payload: {
                columnId: string;
                fromIndex: number;
                toIndex: number;
            }) => any;
            "selection-change": (payload: {
                items: import(".").TaskBoardItem[];
            }) => any;
            "card-move": (payload: import(".").TaskBoardMove) => any;
            "card-click": (payload: {
                item: import(".").TaskBoardItem;
                originalEvent: MouseEvent;
            }) => any;
            "card-activate": (payload: {
                item: import(".").TaskBoardItem;
            }) => any;
            "card-contextmenu": (payload: {
                item: import(".").TaskBoardItem;
                originalEvent: MouseEvent;
            }) => any;
            "add-card": (payload: {
                columnId: string;
                swimlaneId?: string;
            }) => any;
            "column-collapse": (payload: {
                columnId: string;
                collapsed: boolean;
            }) => any;
            "wip-blocked": (payload: {
                columnId: string;
            }) => any;
        }, import("vue").PublicProps, {
            selectionMode: "none" | "single" | "multiple";
            draggable: boolean;
            gap: string;
            columnWidth: string;
            virtualScrollItemHeight: number;
            virtualScrollBuffer: number;
            wipMode: "warn" | "block";
            showCounts: boolean;
            showAddCard: boolean;
            collapsibleColumns: boolean;
            laneWidth: string;
            density: "compact" | "normal" | "roomy";
        }, false, {}, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, {}, any, import("vue").ComponentProvideOptions, {
            P: {};
            B: {};
            D: {};
            C: {};
            M: {};
            Defaults: {};
        }, Readonly<import("./types").ApexBoardProps & {
            items?: import(".").TaskBoardItem[];
            columns?: import(".").TaskBoardColumn[];
            swimlanes?: import(".").TaskBoardSwimlane[];
            columnGroups?: import("./core/taskboard").TaskBoardColumnGroup[];
            reorderableColumns?: boolean;
            confirmMove?: (payload: import(".").TaskBoardMove) => boolean | Promise<boolean>;
            permissions?: import("./core/taskboard").TaskBoardPermissions;
            virtualScroll?: boolean;
            virtualScrollItemHeight?: number;
            virtualScrollBuffer?: number;
            cardFields?: import(".").TaskCardFields;
            draggable?: boolean;
            selectionMode?: "none" | "single" | "multiple";
            wipMode?: "warn" | "block";
            showCounts?: boolean;
            showAddCard?: boolean;
            collapsibleColumns?: boolean;
            columnWidth?: string;
            laneWidth?: string;
            gap?: string;
            height?: string;
            density?: "compact" | "normal" | "roomy";
            background?: string;
            columnBackground?: string;
            cardBackground?: string;
            cardRadius?: string;
            accent?: string;
        }> & Readonly<{
            "onColumn-reorder"?: ((payload: {
                columnId: string;
                fromIndex: number;
                toIndex: number;
            }) => any) | undefined;
            "onSelection-change"?: ((payload: {
                items: import(".").TaskBoardItem[];
            }) => any) | undefined;
            "onCard-move"?: ((payload: import(".").TaskBoardMove) => any) | undefined;
            "onCard-click"?: ((payload: {
                item: import(".").TaskBoardItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onCard-activate"?: ((payload: {
                item: import(".").TaskBoardItem;
            }) => any) | undefined;
            "onCard-contextmenu"?: ((payload: {
                item: import(".").TaskBoardItem;
                originalEvent: MouseEvent;
            }) => any) | undefined;
            "onAdd-card"?: ((payload: {
                columnId: string;
                swimlaneId?: string;
            }) => any) | undefined;
            "onColumn-collapse"?: ((payload: {
                columnId: string;
                collapsed: boolean;
            }) => any) | undefined;
            "onWip-blocked"?: ((payload: {
                columnId: string;
            }) => any) | undefined;
        }>, {
            clearSelection: () => void;
            selectAll: (columnId: string, swimlaneId?: string) => void;
            getState: () => {
                collapsedColumns: string[];
                closedSwimlanes: string[];
                selection: (string | number)[];
                boardScroll: number;
                cellScroll: Record<string, number>;
            };
            setState: (state: ReturnType<() => {
                collapsedColumns: string[];
                closedSwimlanes: string[];
                selection: (string | number)[];
                boardScroll: number;
                cellScroll: Record<string, number>;
            }> | null | undefined) => void;
            exportJson: () => string;
            exportCsv: () => string;
            exportRows: () => {
                id: string | number;
                title: {};
                column: string;
                swimlane: string;
                order: number;
                priority: {};
                assignees: string;
                labels: string;
                due: {};
            }[];
        }, {}, {}, {}, {
            selectionMode: "none" | "single" | "multiple";
            draggable: boolean;
            gap: string;
            columnWidth: string;
            virtualScrollItemHeight: number;
            virtualScrollBuffer: number;
            wipMode: "warn" | "block";
            showCounts: boolean;
            showAddCard: boolean;
            collapsibleColumns: boolean;
            laneWidth: string;
            density: "compact" | "normal" | "roomy";
        }>;
        __isFragment?: never;
        __isTeleport?: never;
        __isSuspense?: never;
    } & import("vue").ComponentOptionsBase<Readonly<import("./types").ApexBoardProps & {
        items?: import(".").TaskBoardItem[];
        columns?: import(".").TaskBoardColumn[];
        swimlanes?: import(".").TaskBoardSwimlane[];
        columnGroups?: import("./core/taskboard").TaskBoardColumnGroup[];
        reorderableColumns?: boolean;
        confirmMove?: (payload: import(".").TaskBoardMove) => boolean | Promise<boolean>;
        permissions?: import("./core/taskboard").TaskBoardPermissions;
        virtualScroll?: boolean;
        virtualScrollItemHeight?: number;
        virtualScrollBuffer?: number;
        cardFields?: import(".").TaskCardFields;
        draggable?: boolean;
        selectionMode?: "none" | "single" | "multiple";
        wipMode?: "warn" | "block";
        showCounts?: boolean;
        showAddCard?: boolean;
        collapsibleColumns?: boolean;
        columnWidth?: string;
        laneWidth?: string;
        gap?: string;
        height?: string;
        density?: "compact" | "normal" | "roomy";
        background?: string;
        columnBackground?: string;
        cardBackground?: string;
        cardRadius?: string;
        accent?: string;
    }> & Readonly<{
        "onColumn-reorder"?: ((payload: {
            columnId: string;
            fromIndex: number;
            toIndex: number;
        }) => any) | undefined;
        "onSelection-change"?: ((payload: {
            items: import(".").TaskBoardItem[];
        }) => any) | undefined;
        "onCard-move"?: ((payload: import(".").TaskBoardMove) => any) | undefined;
        "onCard-click"?: ((payload: {
            item: import(".").TaskBoardItem;
            originalEvent: MouseEvent;
        }) => any) | undefined;
        "onCard-activate"?: ((payload: {
            item: import(".").TaskBoardItem;
        }) => any) | undefined;
        "onCard-contextmenu"?: ((payload: {
            item: import(".").TaskBoardItem;
            originalEvent: MouseEvent;
        }) => any) | undefined;
        "onAdd-card"?: ((payload: {
            columnId: string;
            swimlaneId?: string;
        }) => any) | undefined;
        "onColumn-collapse"?: ((payload: {
            columnId: string;
            collapsed: boolean;
        }) => any) | undefined;
        "onWip-blocked"?: ((payload: {
            columnId: string;
        }) => any) | undefined;
    }>, {
        clearSelection: () => void;
        selectAll: (columnId: string, swimlaneId?: string) => void;
        getState: () => {
            collapsedColumns: string[];
            closedSwimlanes: string[];
            selection: (string | number)[];
            boardScroll: number;
            cellScroll: Record<string, number>;
        };
        setState: (state: ReturnType<() => {
            collapsedColumns: string[];
            closedSwimlanes: string[];
            selection: (string | number)[];
            boardScroll: number;
            cellScroll: Record<string, number>;
        }> | null | undefined) => void;
        exportJson: () => string;
        exportCsv: () => string;
        exportRows: () => {
            id: string | number;
            title: {};
            column: string;
            swimlane: string;
            order: number;
            priority: {};
            assignees: string;
            labels: string;
            due: {};
        }[];
    }, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        "column-reorder": (payload: {
            columnId: string;
            fromIndex: number;
            toIndex: number;
        }) => any;
        "selection-change": (payload: {
            items: import(".").TaskBoardItem[];
        }) => any;
        "card-move": (payload: import(".").TaskBoardMove) => any;
        "card-click": (payload: {
            item: import(".").TaskBoardItem;
            originalEvent: MouseEvent;
        }) => any;
        "card-activate": (payload: {
            item: import(".").TaskBoardItem;
        }) => any;
        "card-contextmenu": (payload: {
            item: import(".").TaskBoardItem;
            originalEvent: MouseEvent;
        }) => any;
        "add-card": (payload: {
            columnId: string;
            swimlaneId?: string;
        }) => any;
        "column-collapse": (payload: {
            columnId: string;
            collapsed: boolean;
        }) => any;
        "wip-blocked": (payload: {
            columnId: string;
        }) => any;
    }, string, {
        selectionMode: "none" | "single" | "multiple";
        draggable: boolean;
        gap: string;
        columnWidth: string;
        virtualScrollItemHeight: number;
        virtualScrollBuffer: number;
        wipMode: "warn" | "block";
        showCounts: boolean;
        showAddCard: boolean;
        collapsibleColumns: boolean;
        laneWidth: string;
        density: "compact" | "normal" | "roomy";
    }, {}, string, {}, import("vue").GlobalComponents, import("vue").GlobalDirectives, string, import("vue").ComponentProvideOptions> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & (new () => {
        $slots: {
            card?: (props: {
                item: import(".").TaskBoardItem;
                selected: boolean;
                canEdit: boolean;
                canDelete: boolean;
                canDrag: boolean;
            }) => unknown;
            'column-header'?: (props: {
                column: import(".").TaskBoardColumn;
                count: number;
                over: boolean;
            }) => unknown;
            'column-footer'?: (props: {
                column: import(".").TaskBoardColumn;
            }) => unknown;
            'swimlane-header'?: (props: {
                swimlane: import(".").TaskBoardSwimlane;
                count: number;
            }) => unknown;
            empty?: (props: {
                column: import(".").TaskBoardColumn;
                swimlane?: import(".").TaskBoardSwimlane;
            }) => unknown;
            'drag-preview'?: (props: {
                items: import(".").TaskBoardItem[];
                count: number;
            }) => unknown;
        };
    });
    TaskCard: import("vue").DefineComponent<import("./types").ApexBoardProps & {
        item: import(".").TaskBoardItem;
        fields?: import(".").TaskCardFields;
        selected?: boolean;
        dragging?: boolean;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("./types").ApexBoardProps & {
        item: import(".").TaskBoardItem;
        fields?: import(".").TaskCardFields;
        selected?: boolean;
        dragging?: boolean;
    }> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    ColumnFilter: import("vue").DefineComponent<{
        ui?: import("./types").ApexDataTableClasses;
        column: import(".").ColumnDef;
        meta?: import(".").FilterMeta;
        mode?: "row" | "menu";
        maxConstraints?: number;
        size?: "small" | "normal" | "large";
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
        clear: () => any;
        update: (v: import(".").FilterMeta) => any;
    }, string, import("vue").PublicProps, Readonly<{
        ui?: import("./types").ApexDataTableClasses;
        column: import(".").ColumnDef;
        meta?: import(".").FilterMeta;
        mode?: "row" | "menu";
        maxConstraints?: number;
        size?: "small" | "normal" | "large";
    }> & Readonly<{
        onClear?: (() => any) | undefined;
        onUpdate?: ((v: import(".").FilterMeta) => any) | undefined;
    }>, {
        mode: "row" | "menu";
        maxConstraints: number;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
    ErrorSummary: import("vue").DefineComponent<{
        errors?: Record<string, string>;
        title?: string;
    }, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{
        errors?: Record<string, string>;
        title?: string;
    }> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
};
/**
 * app.use(ApexUI, { size: 'md', labelPlacement: 'top' })
 * Registers <ApexInput>, <ApexSelect>, … (prefix configurable).
 */
export declare const ApexUI: Plugin;
export default ApexUI;
export { ApexIcon, ApexField, ApexInput, ApexTextarea, ApexNumber, ApexStepper, ApexSelect, ApexMultiselect, ApexCascadeSelect, ApexDatePicker, ApexColorPicker, ApexOtp, ApexPassword, ApexTags, ApexKnob, ApexListbox, ApexOrderList, ApexRating, ApexSelectButton, ApexSlider, ApexToggleButton, ApexTreeSelect, ApexCheckbox, ApexCheckboxGroup, ApexSwitch, ApexSegmented, ApexRadio, ApexRadioGroup, ApexDrawer, ApexDynamicDialog, ApexPopover, ApexFileUpload, ApexImageCrop, ApexImageField, ApexBreadcrumb, ApexContextMenu, ApexDock, ApexMegaMenu, ApexMenu, ApexMenubar, ApexTieredMenu, ApexMessage, ApexToast, ApexCarousel, ApexCarouselContent, ApexCarouselItem, ApexCarouselNav, ApexCarouselControls, ApexCarouselIndicators, ApexCompare, ApexCompareItem, ApexGallery, ApexSidebar, ApexSidebarLayout, ApexSidebarInset, ApexSidebarTrigger, ApexButton, ApexButtonGroup, ApexSpeedDial, ApexSplitButton, ApexDataTable, ApexPaginator, ApexDataView, ApexOrgChart, ApexPickList, ApexTimeline, ApexTree, ApexTreeTable, ApexAccordion, ApexAvatar, ApexBadge, ApexOverlayBadge, ApexBlockUI, ApexChip, ApexInplace, ApexMeterGroup, ApexProgressSpinner, ApexScrollTop, ApexSkeleton, ApexChart, ApexChartGroup, ApexTaskBoard, ApexTaskCard, ApexAvatarGroup, ApexCard, ApexFieldset, ApexPanel, ApexScrollArea, ApexSplitter, ApexSteps, ApexTabs, ApexToolbar, ApexDialog, ApexConfirmPopup, ApexAlert, ApexProgressBar, ApexColumnFilter, ApexErrorSummary, ApexScheduler, ApexCalendar, ApexForm, ApexEditor, ApexHTMLEditor, ApexEditorToolbar, ApexEditorMenubar, ApexEditorBubble, ApexEditorTableGrid, ApexEditorImage, ApexEditorLink, ApexEditorTableTools, ApexEditorObjectBar, ApexEditorImageTools, ApexEditorWordCount, ApexEditorSlash, };
export { useFieldState, nextId } from './core/useFieldState';
export { setPath, isBlank, parseRuleString, normaliseRules, isServerOnly, MESSAGES, LOCAL, validateField as validateFormField, validate as validateForm, serverOnlyFields, isVisible as isFieldVisible, isDisabled as isFieldDisabled, expandCondition, CONTROLS as FORM_CONTROLS, controlFor, normalise as normaliseFormSchema, allFields as allFormFields, knownProps as formKnownProps, makeDriver, DISPLAY_TYPES as FORM_DISPLAY_TYPES, isDisplayType, isUnvalidatedType, DIRECT_BIND_TYPES as FORM_DIRECT_BIND_TYPES, isDirectBindType, } from './core/form';
export type { FormRule, FormRules, FormField, ControlSpec, FormSection, NormalisedSchema, FormSchema, FormDriver, } from './core/form';
export { evalCondition, getPath } from './core/conditions';
export { normaliseOptions, slugify, applyTransform } from './core/utils';
export { formatDate, parseDate, formatTime, monthGrid, EN_LOCALE } from './core/dates';
export { ApexColor } from './core/color';
export { keyFilterAccepts, resolveKeyFilter, guardKeydown, guardPaste } from './core/keyFilter';
export type { KeyFilter, KeyFilterPreset } from './core/keyFilter';
export type { TreeNode } from './components/ApexTreeNode';
export type { OrgNode } from './components/ApexOrgNode.vue';
export { flattenTree, filterTree, cascadeChecks, setBranchChecked, moveNode, allLeafKeys, branchKeys, sortTree, filterTreeRows, aggregateTree, rowOf, removeNode, } from './core/tree';
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
export type { CrumbItem } from './components/ApexBreadcrumb.vue';
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
export { arcPath, pieLayout, polar, radarPath, spokeAngles, gaugeGeometry, angleAt, sliceAt, TAU, } from './core/chart/radial';
export type { PieSlice, RadialFrame, GaugeGeometry } from './core/chart/radial';
export { barSlots, barPath, bubbleRadius } from './core/chart/layout';
export type { BarSlot } from './core/chart/layout';
export { applyWaterfall } from './core/chart/data';
export { heatGrid, heatIntensity, heatBand, candleGeometry, treemapLayout, } from './core/chart/special';
export type { HeatCell, HeatGrid, Candle, CandleGeometry, TreeTile } from './core/chart/special';
export type { TreeNode as ChartTreeNode } from './core/chart/special';
export { ApexChartSeries, ApexChartXAxis, ApexChartYAxis, ApexChartY2Axis, ApexChartLegend, ApexChartTooltip, ApexChartHover, ApexChartDataLabels, ApexChartZoom, ApexChartNavigator, ApexChartReferenceLine, ApexChartReferenceBand, ApexChartTitle, ApexChartCaption, } from './core/chart/parts';
export { createChartRegistry, provideChartRegistry, useChartPart, partList, partOne, CHART_REGISTRY_KEY, } from './core/chart/registry';
export type { ChartRegistry, ChartPartKind } from './core/chart/registry';
export type { BarContext } from './core/chart/data';
export type { ChartPlugin, PluginApi, OverlayNode } from './core/chart/plugins';
export type { TaskBoardColumn, TaskBoardSwimlane, TaskBoardItem, TaskBoardCell, TaskBoardMove, TaskCardFields, } from './core/taskboard';
export type { ToastMessage } from './core/toast';
export { useApexDialog } from './core/dialog';
export { useApexSidebar } from './core/sidebar';
export type { SidebarState } from './core/sidebar';
export { apexTooltip, ApexTooltipPlugin } from './core/tooltip';
export { apexAnimateOnScroll, ApexAnimateOnScrollPlugin } from './core/animateOnScroll';
export { apexFocusTrap, ApexFocusTrapPlugin } from './core/focusTrap';
export { apexRipple, ApexRipplePlugin, rippleAt } from './core/ripple';
export { useOverlayTransition } from './core/overlayTransition';
export { apexStyleClass, ApexStyleClassPlugin } from './core/styleClass';
export type { StyleClassOptions } from './core/styleClass';
export type { RippleOptions } from './core/ripple';
export type { FocusTrapOptions } from './core/focusTrap';
export type { AnimateOnScrollOptions } from './core/animateOnScroll';
export type { TooltipOptions } from './core/tooltip';
export type { DynamicDialogOptions, DynamicDialogInstance, DynamicDialogHandle } from './core/dialog';
export { anchorPosition, resolveTarget } from './core/anchor';
export type { AnchorSide, AnchorAlign } from './core/anchor';
export { inlineOffset, inlineEndDistance, pointerAnchor, isRtlElement } from './core/anchor';
export { registerApexLocales, setApexLocale, getApexLocale, apexLocaleCodes, apexLocalePack, resolveApexLocale, derivePattern, isoWeek, localWeek, weekdayOrder, DEFAULT_LABELS, EN_PACK, } from './core/locale';
export type { ApexLocalePack, ApexLocaleNames, ApexResolvedLocale } from './core/locale';
export * from './core/recurrence';
export * from './core/scheduler';
export * from './core/calendar';
export { baseNodes, baseMarks, emptyDoc, sameDoc } from './core/editor/schema';
export { buildKeymap, activeState } from './core/editor/keymap';
export { buildInputRules } from './core/editor/inputRules';
export type { InputRuleOptions } from './core/editor/inputRules';
export { buildCommands, toggleList, setAlign, toggleTask, setLink, unsetLink, clearMarks, } from './core/editor/commands';
export type { Align } from './core/editor/schema';
export { slashPlugin, filterSlashItems, DEFAULT_SLASH_ITEMS } from './core/editor/slash';
export { cleanPastedHtml, looksLikeMarkdown, parseMarkdown, pastedUrl, } from './core/editor/paste';
export type { PasteOptions } from './core/editor/paste';
export { tableNodes, createTable, buildTableCommands, setCellAlign, inTable, tableKeymap, } from './core/editor/tables';
export { mediaNodes, EMBED_PROVIDERS, matchEmbed, embedSrc, isImageFile, embedNodeView, uploadPlaceholderPlugin, placeholderPos, setMediaAttr, buildMediaCommands, imageNodeView, dragWidth, MIN_IMAGE_WIDTH, } from './core/editor/media';
export type { EmbedProvider, UploadRequest, UploadHandler } from './core/editor/media';
export { commentMark, readAnchors, addComment, removeComment, threadsAtSelection, commentPlugin, } from './core/editor/comments';
export type { CommentAnchor } from './core/editor/comments';
export { suggestionMarks, readSuggestions, asSuggestion, resolveSuggestion, resolveAll, } from './core/editor/suggestions';
export type { SuggestionAuthor, SuggestionRange } from './core/editor/suggestions';
export { toHtml, fromHtml, toMarkdown, toText, wordCount, forExport } from './core/editor/serialise';
export type { ExportOptions } from './core/editor/serialise';
export { assistPlugin, assistKey, assistRange, assistScope, applyAssistResult, } from './core/editor/assist';
export type { AssistAction, AssistRequest, AssistHandler } from './core/editor/assist';
export type { SlashItem, SlashState } from './core/editor/slash';
export { htmlNodes, htmlMarks, withAttrBag, sanitiseAttrs, withClass, VOID_TAGS, FORBIDDEN_TAGS, KNOWN_TAGS, } from './core/editor/htmlSchema';
export { applyBlockStyle, applyCharacterStyle, activeStyle, galleryClasses, } from './core/editor/htmlStyles';
export type { HtmlStyle } from './core/editor/htmlStyles';
export { wrapInContainer, unwrapContainer, retagContainer, insertContainer, deleteContainer, setContainerAttrs, CONTAINER_TAGS, preserveAttrBag, buildPageCommands, blockStyleCommand, readTextStyle, readCellStyle, BLOCK_TYPE_COMMANDS, } from './core/editor/htmlStructure';
export type { TextStyleState, CellState } from './core/editor/htmlStructure';
export { CATALOGUE, MENUS, DOMAINS, describe, unreachableCommands, } from './core/editor/catalogue';
export type { CommandDomain, CommandSpec, SurfaceItem } from './core/editor/catalogue';
export type { HtmlActiveState, HtmlPathEntry } from './components/ApexHTMLEditor.vue';
export type { CellStyleState } from './components/ApexEditorTableTools.vue';
export type { ColorFormat, Channel } from './core/color';
export type { ApexDateLocale } from './core/dates';
export { useApexI18n, APEX_FALLBACK_STRINGS } from './core/i18n';
export { useApexAlert, setAlertInterpreter } from './core/alert';
export type { AlertTone, AlertStage, AlertChange, AlertOptions, AlertButton, AlertSeverity, AlertRunResult, AlertRunOptions, } from './core/alert';
export { useAlertButtons } from './core/alertButtons';
export { useCan } from './core/can';
export { allows, filterItems, filterMenu, filterMega } from './core/menuPermissions';
export type { CanFn, PermissionedRow, PermissionedLink, PermissionedColumn, PermissionedMegaItem, } from './core/menuPermissions';
export { APEX_UI_OPTIONS, APEX_ADAPTER } from './core/symbols';
export { zodAdapter } from './adapters/zod';
export { precognitionAdapter } from './adapters/precognition';
export type { ApexSeverity, ApexButtonVariant } from './components/ApexButton.vue';
export { itemOffset, tooltipSide } from './core/speedDial';
export type { SpeedDialItem, SpeedDialType, SpeedDialDirection } from './core/speedDial';
export type { MenuItem } from './components/ApexMenuItem';
export { getField, setField, cellValue, evalFormula, sortRows, filterRows, matches, aggregate, groupRows, formatCell, nextOrder, } from './core/table';
export type { ColumnDef, SortMeta, SortOrder, FilterModel, FilterMeta, FilterMatchMode, AggregateFn, RowGroup, } from './core/table';
export type * from './types';
