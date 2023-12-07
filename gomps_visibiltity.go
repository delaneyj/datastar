package datastar

import "github.com/delaneyj/toolbelt/gomps"

func Show(booleanExpression string) gomps.NODE {
	return gomps.DATA("show", booleanExpression)
}

func Teleport(querySelectorExpression string) gomps.NODE {
	return gomps.DATA("teleport", querySelectorExpression)
}

func Intersects(querySelectorExpression string) gomps.NODE {
	return gomps.DATA("intersects", querySelectorExpression)
}

func ScrollIntoView() gomps.NODE {
	return gomps.DATA("scroll-into-view")
}

func ViewTransition(name ...string) gomps.NODE {
	if len(name) > 0 {
		return gomps.DATA("view-transition", name[0])
	}
	return gomps.DATA("view-transition")
}
