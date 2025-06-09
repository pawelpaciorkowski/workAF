import {
    Toast,
    initTWE,
} from "tw-elements";
import { BugFill, CheckCircleFill, ExclamationCircleFill, InfoCircleFill } from "react-bootstrap-icons";
import { AlertType } from "../index";

export const AlertInfo = ({ ref, alert }: { ref: any, alert: AlertType }) => {
    initTWE({ Toast }, { allowReinits: true });

    return (
        <div
            className="pointer-events-auto mx-auto mb-4 hidden w-96 max-w-full rounded-lg bg-primary-100 bg-clip-padding text-sm text-primary-700 shadow-lg shadow-black/5 data-[te-toast-show]:block data-[te-toast-hide]:hidden"
            id="static-example"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            data-twe-autohide="false"
            data-twe-toast-init
            data-twe-toast-show>
            <div
                className="flex items-center justify-between rounded-t-lg border-b-2 border-primary-200 bg-primary-100 bg-clip-padding px-4 pb-2 pt-2.5 text-primary-700">
                <p className="flex items-center font-bold text-primary-700">
                    <InfoCircleFill className={'mr-2'} />
                    Informacja
                </p>
            </div>
            <div
                className="break-words rounded-b-lg bg-primary-100 px-4 py-4 text-primary-700">
                {alert.content}
            </div>
        </div>
    )
}

export const AlertSuccess = ({ ref, alert }: { ref: any, alert: AlertType }) => {
    initTWE({ Toast }, { allowReinits: true });

    return (
        <div
            className="pointer-events-auto mx-auto mb-4 hidden w-96 max-w-full rounded-lg bg-success-100 bg-clip-padding text-sm text-success-700 shadow-lg shadow-black/5 data-[te-toast-show]:block data-[te-toast-hide]:hidden"
            id="static-example"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            data-twe-autohide="false"
            data-twe-toast-init
            data-twe-toast-show>
            <div
                className="flex items-center justify-between rounded-t-lg border-b-2 border-success/20 bg-success-100 bg-clip-padding px-4 pb-2 pt-2.5">
                <p className="flex items-center font-bold text-success-700">
                    <CheckCircleFill className={'mr-2'} />
                    Sukces
                </p>
            </div>
            <div
                className="break-words rounded-b-lg bg-success-100 px-4 py-4 text-success-700">
                {alert.content}
            </div>
        </div>
    )
}

export const AlertWarning = ({ ref, alert }: { ref: any, alert: AlertType }) => {
    initTWE({ Toast }, { allowReinits: true });

    return (
        <div
            className="pointer-events-auto mx-auto mb-4 hidden w-96 max-w-full rounded-lg bg-warning-100 bg-clip-padding text-sm text-warning-700 shadow-lg shadow-black/5 data-[te-toast-show]:block data-[te-toast-hide]:hidden"
            id="static-example"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            data-twe-autohide="false"
            data-twe-toast-init
            data-twe-toast-show>
            <div
                className="flex items-center justify-between rounded-t-lg border-b-2 border-warning-200 bg-warning-100 bg-clip-padding px-4 pb-2 pt-2.5 text-warning-700">
                <p className="flex items-center font-bold text-warning-700">
                    <ExclamationCircleFill className={'mr-2'} />
                    Ostrzeżenie
                </p>
            </div>
            <div
                className="break-words rounded-b-lg bg-warning-100 px-4 py-4 text-warning-700">
                {alert.content}
            </div>
        </div>
    )
}

export const AlertDanger = ({ ref, alert }: { ref: any, alert: AlertType }) => {
    initTWE({ Toast }, { allowReinits: true });

    return (
        <div
            className="pointer-events-auto mx-auto mb-4 hidden w-96 max-w-full rounded-lg bg-danger-100 bg-clip-padding text-sm text-danger-700 shadow-lg shadow-black/5 data-[te-toast-show]:block data-[te-toast-hide]:hidden"
            id="static-example"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            data-twe-autohide="false"
            data-twe-toast-init
            data-twe-toast-show>
            <div
                className="flex items-center justify-between rounded-t-lg border-b-2 border-danger-200 bg-danger-100 bg-clip-padding px-4 pb-2 pt-2.5 text-danger-700">
                <p className="flex items-center font-bold text-danger-700">
                    <BugFill className={'mr-2'} />
                    Błąd
                </p>
            </div>
            <div
                className="break-words rounded-b-lg bg-danger-100 px-4 py-4 text-danger-700">
                {alert.content}<br />
                <small>{alert.errorContext}</small>
            </div>
        </div>
    )
}