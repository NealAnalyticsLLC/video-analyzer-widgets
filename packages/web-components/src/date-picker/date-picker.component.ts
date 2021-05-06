import { attr, customElement, FASTElement, observable } from '@microsoft/fast-element';
import { DatePickerEvent, IAllowedDates, IDatePickerRenderEvent } from './date-picker.definitions';
import { styles } from './date-picker.style';
import { template } from './date-picker.template';

/**
 * Date picker component
 * @public
 */
@customElement({
    name: 'media-date-picker',
    template,
    styles
})
export class DatePickerComponent extends FASTElement {
    /**
     * When true, align date picker to the right side of the opener button
     *
     * @public
     * @remarks
     * HTML attribute: alignRight
     */
    @attr public alignRight = false;
    /**
     * Enable UI attribute, when true date picker is shown
     *
     * @public
     * @remarks
     * HTML attribute: enableUI
     */
    @attr public enableUI = false;

    /**
     * Reflects the current selected date
     *
     * @public
     * @remarks
     * HTML attribute: enableUI
     */
    @attr public date: Date = new Date();

    /**
     * Reflects a new input date
     *
     * @public
     * @remarks
     * HTML attribute: inputDate
     */
    @attr public inputDate: string;

    /**
     * Represents available dates - years months and days.
     *
     * @public
     * @remarks
     * HTML attribute: allowedYears
     */
    @observable public allowedDates: IAllowedDates = {
        days: '',
        months: '',
        years: ''
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private datePicker: any = null;

    // Loading sources
    private datePickerCSSLoaded = false;
    private datePickerScriptLoaded = false;
    private jquerySrcLoaded = false;
    private datePickerSrcLoaded = false;
    private uiConnected = false;

    public constructor() {
        super();
        this.createFabricDatePicker();
    }

    public allowedDatesChanged() {
        this.disableDates();
    }

    public inputDateChanged() {
        const dateObj = new Date(this.inputDate);
        if (dateObj.getTime() === this.date.getTime()) {
            return;
        }

        // Update date object and set the date picker
        this.date = dateObj;
        this.datePicker?.picker?.set('select', this.date);
    }

    public connectedCallback() {
        super.connectedCallback();
        this.uiConnected = true;

        this.createDatePicker();
    }

    public disconnectedCallback() {
        // Remove all elements
        // this.shadowRoot?.removeChild(this.shadowRoot.querySelector('#date-picker-css-link'));
        // this.shadowRoot?.removeChild(document.querySelector('#jquery-script'));
        const datePickerSRC = document.querySelector('#date-picker-src-link');
        if (datePickerSRC) {
            this.shadowRoot?.removeChild(datePickerSRC);
        }

        const pickerDateSRC = document.querySelector('#picker-date-src-link');
        if (pickerDateSRC) {
            this.shadowRoot?.removeChild(pickerDateSRC);
        }
    }

    private createFabricDatePicker() {
        const datePickerCSS = document.createElement('link');
        datePickerCSS.setAttribute('id', 'date-picker-css-link');
        datePickerCSS.setAttribute('rel', 'stylesheet');
        datePickerCSS.setAttribute(
            'href',
            'https://static2.sharepointonline.com/files/fabric/office-ui-fabric-js/1.4.0/css/fabric.min.css'
        );

        const jquerySrcLink = document.createElement('script');
        jquerySrcLink.setAttribute('id', 'jquery-script');
        jquerySrcLink.setAttribute('src', 'https://code.jquery.com/jquery-3.6.0.min.js');

        const datePickerSrcLink = document.createElement('script');
        datePickerSrcLink.setAttribute('id', 'date-picker-src-link');
        datePickerSrcLink.setAttribute(
            'src',
            'https://static2.sharepointonline.com/files/fabric/office-ui-fabric-js/1.4.0/js/fabric.min.js'
        );

        const pickerDateSrcLink = document.createElement('script');
        datePickerSrcLink.setAttribute('id', 'picker-date-src-link');
        pickerDateSrcLink.setAttribute('src', 'https://cdn.graph.office.net/prod/Scripts/fabric-js/PickaDate.js');

        datePickerCSS.onload = () => {
            this.datePickerCSSLoaded = true;
            this.createDatePicker();
        };

        datePickerSrcLink.onload = () => {
            this.datePickerScriptLoaded = true;
            this.createDatePicker();
        };

        jquerySrcLink.onload = () => {
            this.shadowRoot.appendChild(pickerDateSrcLink);
            this.shadowRoot.appendChild(datePickerSrcLink);
            this.jquerySrcLoaded = true;
        };

        pickerDateSrcLink.onload = () => {
            this.datePickerSrcLoaded = true;
            this.createDatePicker();
        };

        this.shadowRoot.appendChild(jquerySrcLink);
        this.shadowRoot.appendChild(datePickerCSS);
    }

    private createDatePicker() {
        // If all sources loaded - create fabric date picker
        if (
            !(
                this.uiConnected &&
                this.datePickerCSSLoaded &&
                this.datePickerScriptLoaded &&
                this.jquerySrcLoaded &&
                this.datePickerSrcLoaded
            )
        ) {
            return;
        }

        try {
            setTimeout(() => {
                const DatePickerElements = this.shadowRoot.querySelectorAll('.ms-DatePicker');
                this.datePicker = new window['fabric']['DatePicker'](DatePickerElements[0]);

                this.datePicker.picker.on('open', this.onDateOpen.bind(this));
                this.datePicker.picker.on('set', this.onDateChange.bind(this));
                this.datePicker.picker.on('render', this.onRenderDates.bind(this));

                // Show date picker only after initialization
                this.enableUI = true;

                setTimeout(() => {
                    this.datePicker.picker.set('select', this.date);
                });
            }, 100);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
        }
    }

    private onRenderDates() {
        // When render new month / year, emit the selected ones.
        const eventData: IDatePickerRenderEvent = {
            month: this.datePicker.picker.component.item.view?.month,
            year: this.datePicker.picker.component.item.view?.year
        };
        this.$emit(DatePickerEvent.RENDER, eventData);
        this.disableDates();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onDateChange(event: any) {
        if (event.select) {
            const newDate = new Date(event.select);
            if (this.date.getTime() !== newDate.getTime()) {
                this.date = newDate;
            }
            this.$emit(DatePickerEvent.DATE_CHANGE, this.date);
        }
    }

    private disableMonths() {
        // Take months according to available months list
        const monthsElements = this.shadowRoot.querySelectorAll('.ms-DatePicker-monthOption.js-changeDate');
        const months = this.allowedDates.months?.split(',') || '';
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let index = 0; index < monthsElements.length; index++) {
            const element = monthsElements[index];
            const month = parseInt(element?.getAttribute('data-month'), 10) + 1;
            if (!months?.includes(month.toString())) {
                element?.classList?.add('disabled');
            } else {
                element?.classList?.remove('disabled');
            }
        }
    }

    private disableYears() {
        // Take all days
        const yearsElements = this.shadowRoot.querySelectorAll('.ms-DatePicker-yearOption.js-changeDate');
        const years = this.allowedDates.years?.split(',') || '';
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let index = 0; index < yearsElements.length; index++) {
            const element = yearsElements[index];
            const year = parseInt(element?.getAttribute('data-year'), 10);
            if (!years?.includes(year.toString())) {
                element?.classList?.add('disabled');
            } else {
                element?.classList?.remove('disabled');
            }
        }
    }

    private disableDays() {
        // Take all days
        const daysElements = this.shadowRoot.querySelectorAll('.ms-DatePicker-day.ms-DatePicker-day--infocus');
        const days = this.allowedDates.days?.split(',') || '';
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let index = 0; index < daysElements.length; index++) {
            const element = daysElements[index];
            if (!days?.includes(element?.innerHTML)) {
                element?.classList?.add('disabled');
            } else {
                element?.classList?.remove('disabled');
            }
        }
    }

    private disableDates() {
        this.disableYears();
        this.disableMonths();
        this.disableDays();
    }

    private onDateOpen() {
        this.datePicker.picker.set('select', this.date);
    }
}
