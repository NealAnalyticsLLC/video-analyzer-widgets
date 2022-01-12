/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AVA Player callbacks, contains callbacks for player widget.
 */
export interface IAvaPlayerCallbacks {
    /**
     * AVA player draw inferences callback - override draw inferences callback in BoundingBoxDrawer
     */
    drawInferencesCallback?: (inferences: any[], context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, time: any) => void;
    /**
     * AVA player parse inference callback - override parse inference callback in PlayerWrapper
     */
    parseInferenceCallback?: (inference: any) => any;
    /**
     * AVA player oggle body tracking callback - override toggle body tracking callback in PlayerWrapper
     */
    toggleBodyTrackingCallback?: (isOn: boolean) => void;
}
