package main

import (
	"image"
	"testing"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

func logGlimpse(glimpse *Glimpse) {
	rect := glimpse.Rectangle
	logrus.Infof("[%s (%d) {%s}] --> minX: %d, maxX: %d, minY: %d, maxY: %d", glimpse.Label, glimpse.Layer, glimpse.UUID.String(), rect.Min.X, rect.Max.X, rect.Min.Y, rect.Max.Y)
}

func logRect(label string, rect image.Rectangle) {
	logrus.Infof("[%s] --> minX: %d, maxX: %d, minY: %d, maxY: %d", label, rect.Min.X, rect.Max.X, rect.Min.Y, rect.Max.Y)
}

func logPoint(label string, t *testing.T, point image.Point) {
	t.Logf("[%s] -> x: %d, y: %d", label, point.X, point.Y)
}

// notes

// go find anything that isn't contained by something else using .Contains
// work up the stack to do this

// the something else is then our posiblely visible screens

// as we add more screens we will eventually get glimpses of glimpses
// we need some way to group glimpses by
// 1 : the original app
// 2 : any glimpses that were formed from that original app

type GlimpsePool struct {
	glimpses []*Glimpse
	renderer *ImageRenderer
	screens  []image.Rectangle
}

func NewGlimpsePool(canvas *image.RGBA, screens []image.Rectangle) *GlimpsePool {
	return &GlimpsePool{
		glimpses: make([]*Glimpse, 0),
		renderer: NewImageRenderer(canvas),
		screens:  screens,
	}
}

func NewBlankImageGlimpsePool(screens []image.Rectangle) *GlimpsePool {
	maxX := 0
	maxY := 0
	for _, s := range screens {
		if s.Max.X > maxX {
			maxX = s.Max.X
		}
		if s.Max.Y > maxY {
			maxX = s.Max.Y
		}
	}

	canvas := image.NewRGBA(image.Rect(0, 0, maxX, maxY))
	return NewGlimpsePool(canvas, screens)
}

type Glimpse struct {
	image.Rectangle
	Label string
	Layer int
	UUID  uuid.UUID
}

func NewGlimpse(label string, index int, x0, y0, x1, y1 int) *Glimpse {
	return NewGlimpseFromRect(label, index, image.Rect(x0, y0, x1, y1))
}

func NewGlimpseFromRect(label string, index int, rect image.Rectangle) *Glimpse {
	return &Glimpse{
		UUID:      uuid.New(),
		Label:     label,
		Layer:     index,
		Rectangle: rect,
	}
}

func (gp *GlimpsePool) Add(glimpse *Glimpse) {
	glimpse = gp.clipToScreenBounds(glimpse)

	if gp.Valid(glimpse) {
		// gp.glimpses = append(gp.glimpses, glimpse)
		gp.DisectOnAdd(glimpse)
	}
}

func (gp *GlimpsePool) AddFromBounds(label string, index int, x0, y0, x1, y1 int) {
	gp.Add(NewGlimpse(label, index, x0, y0, x1, y1))
}

func (gp *GlimpsePool) AddFromRect(label string, index int, rect image.Rectangle) {
	gp.Add(NewGlimpseFromRect(label, index, rect))
}

// Valid - checks if the glimpse should be added to the comparison pool. We dont want to add glipmses that aren't actually going to be visible
func (gp *GlimpsePool) Valid(adding *Glimpse) bool {
	// newGlimpses := make([]*Glimpse, 0)
	// for _, current := range gp.Glimpses {
	isHiddenUnderneath := false
	for _, existing := range gp.glimpses {
		if adding.UUID.String() == existing.UUID.String() {
			continue
		}

		// logrus.Info("current")
		// logGlimpse(current)
		// logrus.Info("compare")
		// logGlimpse(compare)
		if adding.Layer > existing.Layer { // lowest layer is best i.e. 0 is foremost screen
			// check if its underneath our compare
			if adding.Rectangle.In(existing.Rectangle) {
				isHiddenUnderneath = true
				break
			}
		}
	}
	return !isHiddenUnderneath // reverse the logic as its invalid to be hidden
}

func (gp *GlimpsePool) DumpGlimpses() {
	for _, g := range gp.glimpses {
		logGlimpse(g)
	}
}

func (gp *GlimpsePool) DisectOnAdd(adding *Glimpse) {
	// at this point we have already validated its not hidden undersomething
	isDisected := false
	for _, existing := range gp.glimpses {
		if adding.UUID.String() == existing.UUID.String() {
			continue
		}
		if adding.Rectangle.Overlaps(existing.Rectangle) {
			isDisected = true
			glimpses := disectGlimpse(adding, existing)
			for _, g := range glimpses {
				gp.DisectOnAdd(g)
			}
		}
	}

	if !isDisected {
		// if we have looped all our current rects and havent desected
		// then we can finally add what ever final disection we came out with to the pool
		// this is because we simply go deeper and deeper with disection until we get a non overlaping glimpse
		gp.glimpses = append(gp.glimpses, adding)
	}
}

func (gp *GlimpsePool) clipToScreenBounds(glimpse *Glimpse) *Glimpse {
	bigestIntersection := image.Rect(-1, -1, -1, -1)
	for _, scr := range gp.screens {
		intersection := glimpse.Rectangle.Intersect(scr)
		intersectionArea := intersection.Size().X * intersection.Size().Y
		// logRect("intersection", intersection)
		bigestIntersectionArea := bigestIntersection.Size().X * bigestIntersection.Size().Y
		if intersectionArea > bigestIntersectionArea {
			bigestIntersection = intersection
		}
	}
	return NewGlimpseFromRect(glimpse.Label, glimpse.Layer, bigestIntersection)
}

func disectGlimpse(adding *Glimpse, existing *Glimpse) []*Glimpse {
	glimpses := make([]*Glimpse, 0)
	// var lower, higher Glimpse
	// if existing.Layer > adding.Layer { // its reversed because the lowest layer is best i.e. 0 is foremost screen
	// 	logrus.Error("should not happen")
	// 	logrus.Error("higher")
	// 	logGlimpse(existing)
	// 	logrus.Error("lower")
	// 	logGlimpse(adding)
	// 	logrus.Fatal("dead")
	// }

	// img1Rect := ImageRectToGeoRect(img1)
	// img2Rect := ImageRectToGeoRect(img2)

	// if higher.Rectangle.Overlaps(lower.Rectangle) { // this logic is wrong as it only accounts for the
	// pointMin := higher.Min.Sub(lower.Min) // if min has positives draw it
	// logrus.Infof("pointMIn X %d Y %d", pointMin.X, pointMin.Y)
	// pointMax := higher.Max.Sub(lower.Max) // if max has negetives draw it
	// logPoint("min", t, pointMin)
	// logPoint("max", t, pointMax)
	// if any of these points are different i.e. not equal to 0 we need to create outer rectangles for all 4 off the different points
	// we are drawing the outer edge

	// modifer := 1
	// always trying to work out the lower
	if adding.Min.X < existing.Min.X {
		outerLeft := image.Rect(-1, -1, -1, -1)
		outerLeft.Min.X = adding.Min.X
		outerLeft.Max.X = existing.Min.X
		outerLeft.Min.Y = adding.Min.Y
		outerLeft.Max.Y = adding.Max.Y
		glimpses = append(glimpses, NewGlimpseFromRect(adding.Label, adding.Layer+1, outerLeft))
		// gp.AddFromRect(lower.Label, lower.Layer+1, outerLeft)
		// modifer = -1
	}

	if adding.Min.Y < existing.Min.Y {
		outerTop := image.Rect(-1, -1, -1, -1)
		outerTop.Min.X = adding.Min.X
		outerTop.Max.X = adding.Max.X
		outerTop.Min.Y = adding.Min.Y
		outerTop.Max.Y = existing.Min.Y
		glimpses = append(glimpses, NewGlimpseFromRect(adding.Label, adding.Layer+1, outerTop))

		// gp.AddFromRect(lower.Label, lower.Layer+1, outerTop)
		// modifer = -1
	}

	if adding.Max.X > existing.Max.X {
		outerRight := image.Rect(-1, -1, -1, -1)
		outerRight.Min.X = existing.Max.X
		outerRight.Max.X = adding.Max.X
		outerRight.Min.Y = adding.Min.Y
		outerRight.Max.Y = adding.Max.Y
		glimpses = append(glimpses, NewGlimpseFromRect(adding.Label, adding.Layer+1, outerRight))

		// gp.AddFromRect(lower.Label, lower.Layer+1, outerRight)
		// modifer = -1
	}

	if adding.Max.Y > existing.Max.Y {
		outerBottom := image.Rect(-1, -1, -1, -1)
		outerBottom.Min.X = adding.Min.X
		outerBottom.Max.X = adding.Max.X
		outerBottom.Min.Y = existing.Max.Y
		outerBottom.Max.Y = adding.Max.Y
		glimpses = append(glimpses, NewGlimpseFromRect(adding.Label, adding.Layer+1, outerBottom))
		// gp.AddFromRect(lower.Label, lower.Layer+1, outerBottom)
		// modifer = -1
	}

	// adding.Layer = adding.Layer * modifer
	return glimpses
}

func (gp *GlimpsePool) Image() *image.RGBA {
	return gp.renderer.img
}

func (gp *GlimpsePool) DrawGlimpses() {
	for _, glimpse := range gp.glimpses {
		// logGlimpse(glimpse)
		if glimpse.Layer >= 0 && !glimpse.Rectangle.Empty() {
			gp.renderer.DrawLabeledRectangle(glimpse.Label, glimpse.Rectangle)
		}
	}
}

func (gp *GlimpsePool) GreyOutFromLabels(excludeScreenLabels []string) {
	for _, glimpse := range gp.glimpses {
		// logGlimpse(glimpse)
		if glimpse.Layer >= 0 && !glimpse.Rectangle.Empty() {

			for _, excludeScreenLabel := range excludeScreenLabels {
				logrus.Info("excludeScreenLabel", excludeScreenLabel, "glimpse.Label", glimpse.Label)
				if glimpse.Label == excludeScreenLabel {
					gp.renderer.DrawGreyedOutRect(glimpse.Label, glimpse.Rectangle)
				}
			}
		}
	}
}

func (gp *GlimpsePool) RenderAsFile(fullFilePath string) error {
	// canvas := image.NewRGBA(image.Rect(0, 0, x, y))
	gp.DrawGlimpses()
	return gp.renderer.Write(fullFilePath) //"./test-image.png"
}
