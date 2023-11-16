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
