package main

import (
	"fmt"
	"image"
	"math"
	"strconv"
	"testing"

	"github.com/sirupsen/logrus"
)

func logGlimpse(glimpse *Glimpse) {
	logGlimpseNote("DEFAULT -> ", glimpse)
}

func logGlimpseNote(note string, glimpse *Glimpse) {
	rect := glimpse.Rectangle
	logrus.Infof("%s [%s layer(%d)] --> minX: %d, maxX: %d, minY: %d, maxY: %d", note, glimpse.Label, glimpse.Layer, rect.Min.X, rect.Max.X, rect.Min.Y, rect.Max.Y)
}

func logRect(label string, rect image.Rectangle) {
	logrus.Infof("[%s] --> minX: %d, maxX: %d, minY: %d, maxY: %d", label, rect.Min.X, rect.Max.X, rect.Min.Y, rect.Max.Y)
}

func logPoint(label string, t *testing.T, point image.Point) {
	t.Logf("[%s] -> x: %d, y: %d", label, point.X, point.Y)
}

type GlimpsePool struct {
	glimpses   []*Glimpse
	renderer   *ImageRenderer
	screens    []image.Rectangle
	minXOffset int
	minYOffset int
	// maxX     int
	// maxY     int
}

func NewGlimpsePoolDebug(canvas *image.RGBA, screens []image.Rectangle) *GlimpsePool {
	return newGlimpsePool(canvas, screens, NewImageRendererDebug(canvas))
}

func NewGlimpsePool(canvas *image.RGBA, screens []image.Rectangle) *GlimpsePool {
	return newGlimpsePool(canvas, screens, NewImageRenderer(canvas))
}

func newGlimpsePool(canvas *image.RGBA, screens []image.Rectangle, renderer *ImageRenderer) *GlimpsePool {
	// normalise screens
	minX := 0
	minY := 0
	maxX := 0
	maxY := 0
	for i, screen := range screens {
		logRect("screen_"+strconv.Itoa(i), screen)
		if screen.Max.X > maxX {
			maxX = screen.Max.X
		}
		if screen.Max.Y > maxY {
			maxY = screen.Max.Y
		}
		if screen.Min.X < minX {
			minX = screen.Min.X
		}
		if screen.Min.Y < minY {
			minY = screen.Min.Y
		}
	}
	minX = int(math.Abs(float64(minX)))
	minY = int(math.Abs(float64(minY)))
	logrus.Infof("minX %d", minX)
	logrus.Infof("minY %d", minY)

	// move everything over
	newScreens := make([]image.Rectangle, 0)
	for _, screen := range screens {
		newScreens = append(newScreens, image.Rectangle{
			Min: image.Point{
				X: screen.Min.X + minX,
				Y: screen.Min.Y + minY,
			},
			Max: image.Point{
				X: screen.Max.X + minX,
				Y: screen.Max.Y + minY,
			},
		})
	}
	for i, scr := range newScreens {
		logRect("screen_"+strconv.Itoa(i), scr)
	}
	if canvas == nil {
		canvas = image.NewRGBA(image.Rect(0, 0, maxX, maxY))
		renderer.img = canvas
	}

	return &GlimpsePool{
		glimpses: make([]*Glimpse, 0),
		renderer: renderer,
		screens:  newScreens,
		// maxX:     maxX,
		// maxY:     maxY,
		minXOffset: minX,
		minYOffset: minY,
	}
}

func (gp *GlimpsePool) SetDebugColor(hexColor string) error {
	if gp.renderer == nil {
		return fmt.Errorf("renderer is nil")
	}

	col, err := ParseHexColor(hexColor)
	if err != nil {
		return fmt.Errorf("failed to parse %s", "s")
	}
	gp.renderer.color = col
	return nil
}

func NewBlankImageGlimpsePool(screens []image.Rectangle) *GlimpsePool {
	gp := NewGlimpsePool(nil, screens)
	return gp
}

type Glimpse struct {
	image.Rectangle
	Label string
	Layer int
}

func newGlimpse(label string, index int, x0, y0, x1, y1 int) *Glimpse {
	return newGlimpseFromRect(label, index, image.Rect(x0, y0, x1, y1))
}

func newGlimpseFromRect(label string, index int, rect image.Rectangle) *Glimpse {
	return &Glimpse{
		Label:     label,
		Layer:     index,
		Rectangle: rect,
	}
}

func (gp *GlimpsePool) Add(glimpse *Glimpse) {
	// glimpse = gp.clipToScreenBounds(glimpse)
	// logGlimpseNote("ADD", glimpse)

	if gp.Valid(glimpse) {
		// gp.glimpses = append(gp.glimpses, glimpse)
		gp.DisectOnAdd(glimpse)
	}
}

func (gp *GlimpsePool) AddFromBounds(label string, index int, minX, minY, maxX, maxY int) {
	minX = minX + gp.minXOffset
	maxX = maxX + gp.minXOffset
	minY = minY + gp.minYOffset
	maxY = maxY + gp.minYOffset
	gp.Add(newGlimpse(label, index, minX, minY, maxX, maxY))
}

func (gp *GlimpsePool) AddFromRect(label string, index int, rect image.Rectangle) {
	gp.AddFromBounds(label, index, rect.Min.X, rect.Min.Y, rect.Max.X, rect.Max.Y)
}

// Valid - checks if the glimpse should be added to the comparison pool. We dont want to add glipmses that aren't actually going to be visible
func (gp *GlimpsePool) Valid(adding *Glimpse) bool {
	// newGlimpses := make([]*Glimpse, 0)
	// for _, current := range gp.Glimpses {
	isHiddenUnderneath := false
	isExisting := false
	for _, existing := range gp.glimpses {
		if adding.Rectangle.Eq(existing.Rectangle) {
			isExisting = true
			break
		}

		if adding.Layer > existing.Layer { // lowest layer is best i.e. 0 is foremost screen
			// check if its underneath our compare
			if adding.Rectangle.In(existing.Rectangle) {
				isHiddenUnderneath = true
				break
			}
		}
	}

	if isExisting {
		return false
	}
	if isHiddenUnderneath {
		return false
	}

	return true
}

func (gp *GlimpsePool) DumpGlimpses() {
	for _, g := range gp.glimpses {
		logGlimpseNote("fullDUMP -> ", g)
	}
}

func (gp *GlimpsePool) CurrentGlimpses() []Glimpse {
	gls := make([]Glimpse, 0)
	for _, g := range gp.glimpses {
		gls = append(gls, *g)
	}
	return gls
}
func (gp *GlimpsePool) DisectOnAdd(adding *Glimpse) {
	gp.disectOnAddR(gp.CurrentGlimpses(), adding, 0)
}

func (gp *GlimpsePool) disectOnAddR(glimpses []Glimpse, adding *Glimpse, depth int) {
	if depth > 5 {
		logrus.Info("opppsie")
		return
	}
	// at this point we have already validated its not hidden undersomething
	isDisected := false
	for _, existing := range glimpses {
		if adding.Rectangle.Overlaps(existing.Rectangle) { // we need to
			logGlimpseNote("EXISTING -> ", &existing)
			logGlimpseNote("ADDING -> ", adding)
			newGlimpses := disectGlimpse(adding, existing)
			isDisected = true
			for _, ng := range newGlimpses {
				gp.Add(ng)
			}
			return
		}
	}

	// if we have looped all our current rects and havent desected
	// then we can finally add what ever final disection we came out with to the pool
	// this is because we simply go deeper and deeper with disection until we get a non overlaping glimpse
	if !isDisected {
		gp.glimpses = append(gp.glimpses, adding)
	}
}

// func (gp *GlimpsePool) clipToScreenBounds(glimpse *Glimpse) *Glimpse {
// 	screenIndex := -1
// 	var scr image.Rectangle
// 	// for i, s := range gp.screens {
// 	// 	if glimpse.Rectangle.In(scr) {
// 	// 		scr = s
// 	// 		screenIndex = i
// 	// 		break
// 	// 	}
// 	// }

// 	bigestIntersection := image.Rect(-1, -1, -1, -1)
// 	intersection := glimpse.Rectangle.Intersect(scr)
// 	intersectionArea := intersection.Size().X * intersection.Size().Y
// 	bigestIntersectionArea := bigestIntersection.Size().X * bigestIntersection.Size().Y
// 	if intersectionArea > bigestIntersectionArea {
// 		bigestIntersection = intersection
// 	}
// 	g := newGlimpseFromRect(glimpse.Label, glimpse.Layer, bigestIntersection)
// 	g.ScreenIndex = screenIndex
// 	return g
// }

// func (gp *GlimpsePool) clipToScreenBounds(glimpse *Glimpse) *Glimpse {
// 	bigestIntersection := image.Rect(-1, -1, -1, -1)
// 	for _, scr := range gp.screens {
// 		intersection := glimpse.Rectangle.Intersect(scr)
// 		intersectionArea := intersection.Size().X * intersection.Size().Y
// 		// logRect("intersection", intersection)
// 		bigestIntersectionArea := bigestIntersection.Size().X * bigestIntersection.Size().Y
// 		if intersectionArea > bigestIntersectionArea {
// 			bigestIntersection = intersection
// 		}
// 	}
// 	return newGlimpseFromRect(glimpse.Label, glimpse.Layer, bigestIntersection)
// }

func disectGlimpse(adding *Glimpse, existing Glimpse) []*Glimpse {
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
		glimpses = append(glimpses, newGlimpseFromRect(adding.Label, adding.Layer+1, outerLeft))
		// gp.AddFromRect(lower.Label, lower.Layer+1, outerLeft)
		// modifer = -1
	}

	if adding.Min.Y < existing.Min.Y {
		outerTop := image.Rect(-1, -1, -1, -1)
		outerTop.Min.X = adding.Min.X
		outerTop.Max.X = adding.Max.X
		outerTop.Min.Y = adding.Min.Y
		outerTop.Max.Y = existing.Min.Y
		glimpses = append(glimpses, newGlimpseFromRect(adding.Label, adding.Layer+1, outerTop))

		// gp.AddFromRect(lower.Label, lower.Layer+1, outerTop)
		// modifer = -1
	}

	if adding.Max.X > existing.Max.X {
		outerRight := image.Rect(-1, -1, -1, -1)
		outerRight.Min.X = existing.Max.X
		outerRight.Max.X = adding.Max.X
		outerRight.Min.Y = adding.Min.Y
		outerRight.Max.Y = adding.Max.Y
		glimpses = append(glimpses, newGlimpseFromRect(adding.Label, adding.Layer+1, outerRight))

		// gp.AddFromRect(lower.Label, lower.Layer+1, outerRight)
		// modifer = -1
	}

	if adding.Max.Y > existing.Max.Y {
		outerBottom := image.Rect(-1, -1, -1, -1)
		outerBottom.Min.X = adding.Min.X
		outerBottom.Max.X = adding.Max.X
		outerBottom.Min.Y = existing.Max.Y
		outerBottom.Max.Y = adding.Max.Y
		glimpses = append(glimpses, newGlimpseFromRect(adding.Label, adding.Layer+1, outerBottom))
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
		if glimpse.Layer >= 0 && !glimpse.Rectangle.Empty() {
			gp.renderer.DrawLabeledRectangle(glimpse.Label, glimpse.Rectangle)
		}
	}
}

func (gp *GlimpsePool) GreyOutFromLabels(excludeScreenLabels []string) {
	for _, glimpse := range gp.glimpses {
		if glimpse.Layer >= 0 && !glimpse.Rectangle.Empty() {
			for _, excludeScreenLabel := range excludeScreenLabels {
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

// notes

// go find anything that isn't contained by something else using .Contains
// work up the stack to do this

// the something else is then our posiblely visible screens

// as we add more screens we will eventually get glimpses of glimpses
// we need some way to group glimpses by
// 1 : the original app
// 2 : any glimpses that were formed from that original app
