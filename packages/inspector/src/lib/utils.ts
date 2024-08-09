export const datastarInspectorEvtName = "datastar-inspector-event";

const datastarDefaultEventOptions: CustomEventInit = {
  bubbles: true,
  cancelable: true,
  composed: true,
};

export type DatastarInspectorEvent = {
  time: Date;
  name: string;
  script: string;
};

export const sendDatastarInspectorEvent = (
  name: string,
  script: string,
  opts: CustomEventInit = datastarDefaultEventOptions,
) => {
  console.log("dispatching inspector event");
  globalThis.dispatchEvent(
    new CustomEvent<DatastarInspectorEvent>(
      datastarInspectorEvtName,
      Object.assign(
        {
          detail: {
            time: new Date(),
            name,
            script,
          },
        },
        opts,
      ),
    ),
  );
};
