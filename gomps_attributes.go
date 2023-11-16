package datastar

import (
	"fmt"
	"time"

	"github.com/delaneyj/toolbelt/gomps"
)

func Bind(attributeName, expression string) gomps.NODE {
	return gomps.DATA("bind-"+attributeName, expression)
}

func Model(expression string) gomps.NODE {
	return gomps.DATA("model", expression)
}

func Text(expression string) gomps.NODE {
	return gomps.DATA("text", expression)
}

func TextF(format string, args ...interface{}) gomps.NODE {
	return gomps.DATA("text", fmt.Sprintf(format, args...))
}

func On(eventName, expression string) gomps.NODE {
	return gomps.DATA("on-"+eventName, expression)
}

func OnDebounce(eventName string, delay time.Duration, expression string) gomps.NODE {
	return On(fmt.Sprintf("%s.debounce_%dms", eventName, delay.Milliseconds()), expression)
}

func OnThrottle(eventName string, delay time.Duration, expression string) gomps.NODE {
	return On(fmt.Sprintf("%s.throttle_%dms", eventName, delay.Milliseconds()), expression)
}

func Focus(expression string) gomps.NODE {
	return gomps.DATA("focus")
}

func Prompt(signalName, message string) gomps.NODE {
	return gomps.DATA("prompt", fmt.Sprintf("%s;%s", signalName, message))
}

func Confirm(signalName, message string) gomps.NODE {
	return gomps.DATA("confirm", fmt.Sprintf("%s;%s", signalName, message))
}
