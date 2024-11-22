// Authors: Delaney Gillilan
// Icon: clarity:two-way-arrows-line
// Slug: Enable two-way data binding
// Description: This attribute plugin enables two-way data binding for input elements.

import { AttributePlugin } from "../../../../engine";
import {
    ERR_BAD_ARGS,
    ERR_METHOD_NOT_ALLOWED,
} from "../../../../engine/errors";

const dataURIRegex = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/;
const updateModelEvents = ["change", "input", "keydown"];

export const Model: AttributePlugin = {
    pluginType: "attribute",
    name: "model",
    mustHaveEmptyKey: true,
    // bypassExpressionFunctionCreation: () => true,
    onLoad: (ctx) => {
        const { el, expression, upsertSignal } = ctx;
        const signalName = expression;
        if (typeof signalName !== "string") {
            // Signal name must be a string
            throw ERR_BAD_ARGS;
        }

        const tnl = el.tagName.toLowerCase();

        let signalDefault: string | boolean | File = "";
        const isInput = tnl.includes("input");
        const type = el.getAttribute("type");
        const isCheckbox = tnl.includes("checkbox") ||
            (isInput && type === "checkbox");
        if (isCheckbox) {
            signalDefault = false;
        }
        const isSelect = tnl.includes("select");
        const isRadio = tnl.includes("radio") || (isInput && type === "radio");
        const isFile = isInput && type === "file";
        if (isFile) {
            // can't set a default value for a file input, yet
        }
        if (isRadio) {
            const name = el.getAttribute("name");
            if (!name?.length) {
                el.setAttribute("name", signalName);
            }
        }

        const signal = upsertSignal(signalName, signalDefault);

        const setInputFromSignal = () => {
            const hasValue = "value" in el;
            const v = signal.value;
            const vStr = `${v}`;
            if (isCheckbox || isRadio) {
                const input = el as HTMLInputElement;
                if (isCheckbox) {
                    input.checked = v;
                } else if (isRadio) {
                    // evaluate the value as string to handle any type casting
                    // automatically since the attribute has to be a string anyways
                    input.checked = vStr === input.value;
                }
            } else if (isFile) {
                // File input reading from a signal is not supported yet
            } else if (isSelect) {
                const select = el as HTMLSelectElement;
                if (select.multiple) {
                    Array.from(select.options).forEach((opt) => {
                        if (opt?.disabled) return;
                        opt.selected = v.includes(opt.value);
                    });
                } else {
                    select.value = vStr;
                }
            } else if (hasValue) {
                el.value = vStr;
            } else {
                el.setAttribute("value", vStr);
            }
        };
        const cleanupSetInputFromSignal = ctx.reactivity.effect(
            setInputFromSignal,
        );

        const setSignalFromInput = async () => {
            if (isFile) {
                const files = [...((el as HTMLInputElement)?.files || [])],
                    allContents: string[] = [],
                    allMimes: string[] = [],
                    allNames: string[] = [];

                await Promise.all(
                    files.map((f) => {
                        return new Promise<void>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                if (typeof reader.result !== "string") {
                                    // console.error(`Invalid result type: ${typeof reader.result}`);
                                    throw ERR_BAD_ARGS;
                                }
                                const match = reader.result.match(dataURIRegex);
                                if (!match?.groups) {
                                    // console.error(`Invalid data URI: ${reader.result}`);
                                    throw ERR_BAD_ARGS;
                                }
                                allContents.push(match.groups.contents);
                                allMimes.push(match.groups.mime);
                                allNames.push(f.name);
                            };
                            reader.onloadend = () => resolve(void 0);
                            reader.readAsDataURL(f);
                        });
                    }),
                );

                signal.value = allContents;
                const s = ctx.store();
                const mimeName = `${signalName}Mimes`,
                    nameName = `${signalName}Names`;
                if (mimeName in s) {
                    s[`${mimeName}`].value = allMimes;
                }
                if (nameName in s) {
                    s[`${nameName}`].value = allNames;
                }
                return;
            }

            const current = signal.value;
            const input = (el as HTMLInputElement) || (el as HTMLElement);

            if (typeof current === "number") {
                signal.value = Number(
                    input.value || input.getAttribute("value"),
                );
            } else if (typeof current === "string") {
                signal.value = input.value || input.getAttribute("value") ||
                    "";
            } else if (typeof current === "boolean") {
                if (isCheckbox) {
                    signal.value = input.checked ||
                        input.getAttribute("checked") === "true";
                } else {
                    signal.value = Boolean(
                        input.value || input.getAttribute("value"),
                    );
                }
            } else if (typeof current === "undefined") {
            } else if (typeof current === "bigint") {
                signal.value = BigInt(
                    input.value || input.getAttribute("value") || "0",
                );
            } else if (Array.isArray(current)) {
                // check if the input is a select element
                if (isSelect) {
                    const select = el as HTMLSelectElement;
                    const selectedOptions = [...select.selectedOptions];
                    const selectedValues = selectedOptions.map((opt) =>
                        opt.value
                    );
                    signal.value = selectedValues;
                } else {
                    signal.value = JSON.parse(input.value).split(",");
                }
                console.log(input.value);
            } else {
                // console.log(`Unsupported type ${typeof current}`);
                throw ERR_METHOD_NOT_ALLOWED;
            }
        };

        const parts = el.tagName.split("-");
        const isCustomElement = parts.length > 1;
        if (isCustomElement) {
            const customElementPrefix = parts[0].toLowerCase();
            updateModelEvents.forEach((eventType) => {
                updateModelEvents.push(`${customElementPrefix}-${eventType}`);
            });
        }

        updateModelEvents.forEach((eventType) =>
            el.addEventListener(eventType, setSignalFromInput)
        );

        return () => {
            cleanupSetInputFromSignal();
            updateModelEvents.forEach((event) =>
                el.removeEventListener(event, setSignalFromInput)
            );
        };
    },
};
