// Authors: Delaney Gillilan
// Icon: akar-icons:link-chain
// Slug: Bind attributes to expressions
// Description: Any attribute can be bound to an expression. The attribute will be updated reactively whenever the expression signal changes.

import { AttributePlugin } from "../../../../engine";
import { PluginType } from "../../../../engine/enums";
import {
  ERR_BAD_ARGS,
  ERR_METHOD_NOT_ALLOWED,
} from "../../../../engine/errors";
import { kebabize } from "../../../../utils/text";
import { Signal } from "../../../../vendored";

const dataURIRegex = /^data:(?<mime>[^;]+);base64,(?<contents>.*)$/;
const updateModelEvents = ["change", "input", "keydown"];

export const Bind: AttributePlugin = {
  pluginType: PluginType.Attribute,
  name: "bind",
  onLoad: (ctx) => {
    const {
      el,
      expression,
      expressionFn,
      key,
      signals,
      reactivity: { effect },
    } = ctx;

    let setFromSignal = () => {};
    let fromElementToSignal = () => {};

    const isTwoWayBinding = key === "";

    if (isTwoWayBinding) {
      // I better be tied to a signal
      if (typeof expression !== "string") {
        throw new Error("Invalid expression");
      }
      if (expression.includes("$")) {
        throw new Error("Not an expression");
      }

      const tnl = el.tagName.toLowerCase();
      let signalDefault: string | boolean | number | File = "";
      const isInput = tnl.includes("input");
      const type = el.getAttribute("type");
      const isCheckbox = tnl.includes("checkbox") ||
        (isInput && type === "checkbox");
      if (isCheckbox) {
        signalDefault = false;
      }
      const isNumber = isInput && type === "number";
      if (isNumber) {
        signalDefault = 0;
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
          el.setAttribute("name", expression);
        }
      }

      const signal: Signal<any> = signals.upsert(
        expression,
        signalDefault,
      );

      setFromSignal = () => {
        const hasValue = "value" in el;
        const v = signal.value;
        const vStr = `${v}`;
        if (isCheckbox || isRadio) {
          const input = el as HTMLInputElement;
          if (isCheckbox) {
            input.checked = !!!v || v === "true";
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
              if (typeof v === "string") {
                opt.selected = v.includes(opt.value);
              } else if (typeof v === "number") {
                opt.selected = v === Number(opt.value);
              } else {
                opt.selected = v;
              }
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

      fromElementToSignal = async () => {
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

          signal.value = allContents.join(",");
          const { signals } = ctx;
          const mimeName = `${expression}Mimes`,
            nameName = `${expression}Names`;
          if (mimeName in signals) {
            signals.upsert(mimeName, allMimes);
          }
          if (nameName in signals) {
            signals.upsert(nameName, allNames);
          }
          return;
        }

        const current = signal.value;
        const input = (el as HTMLInputElement) || (el as HTMLElement);

        if (typeof current === "number") {
          signal.value = Number(input.value || input.getAttribute("value"));
        } else if (typeof current === "string") {
          signal.value = input.value || input.getAttribute("value") || "";
        } else if (typeof current === "boolean") {
          if (isCheckbox) {
            signal.value = input.checked ||
              input.getAttribute("checked") === "true";
          } else {
            signal.value = Boolean(input.value || input.getAttribute("value"));
          }
        } else if (typeof current === "undefined") {
        } else if (Array.isArray(current)) {
          // check if the input is a select element
          if (isSelect) {
            const select = el as HTMLSelectElement;
            const selectedOptions = [...select.selectedOptions];
            const selectedValues = selectedOptions.map((opt) => opt.value);
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
    } else {
      // tied to an attribute
      const kebabKey = kebabize(key);
      setFromSignal = () => {
        const value = expressionFn(ctx);
        let v: string;
        if (typeof value === "string") {
          v = value;
        } else {
          v = JSON.stringify(value);
        }
        if (!v || v === "false" || v === "null" || v === "undefined") {
          el.removeAttribute(kebabKey);
        } else {
          el.setAttribute(kebabKey, v);
        }
      };
    }

    if (isTwoWayBinding) {
      updateModelEvents.forEach((event) => {
        el.addEventListener(event, fromElementToSignal);
      });
    }

    const setElementFromSignalDisposer = effect(async () => {
      setFromSignal();
    });

    return () => {
      setElementFromSignalDisposer();

      if (isTwoWayBinding) {
        updateModelEvents.forEach((event) => {
          el.removeEventListener(event, fromElementToSignal);
        });
      }
    };
  },
};
