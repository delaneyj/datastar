export interface DocumentSupportingViewTransitionAPI {
    startViewTransition(
        updateCallback: () => Promise<void> | void,
    ): ViewTransition;
}

export interface ViewTransition {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition(): void;
}

export const docWithViewTransitionAPI =
    document as unknown as DocumentSupportingViewTransitionAPI;
export const supportsViewTransitions = !!docWithViewTransitionAPI
    .startViewTransition;
