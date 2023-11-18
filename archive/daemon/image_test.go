package main

import (
	"encoding/json"
	"testing"

	"github.com/golang/geo/r2"
	"gopkg.in/stretchr/testify.v1/assert"
)

func TestTwoRectangles(t *testing.T) {

	screentotal := r2.RectFromPoints(r2.Point{0, 0}, r2.Point{1200, 600})
	screen1 := r2.RectFromPoints(r2.Point{300, 0}, r2.Point{1200, 600})
	screen2 := r2.RectFromPoints(r2.Point{0, 0}, r2.Point{1100, 600})

	p1 := r2.Point{1200, 600}
	p2 := r2.Point{1100, 600}

	t.Log("Sub")
	// p1.Cross(p2)
	sub := p1.Sub(p2)
	t.Log(sub)
	offset := p2.Add(sub)

	t.Log("newrect")
	new := r2.RectFromPoints(p2, offset)
	t.Log(new)

	assert.Equal(t, true, screen2.Contains(screen1), "doesnt contain this")

	// t.Log(screen1.ClampPoint(screen2.Hi()))
	// t.Log(screen1.Intersection(screen2))

	t.Log("diff")
	diff := screen1.Intersection(screen2)
	t.Log(diff)

	t.Log("diffPoint")
	diffPoint := screen1.ClampPoint(screen2.Hi())
	t.Log(diffPoint)

	t.Log("diff screen total")
	t.Log(diff.Intersection(screentotal))

	t.Log()
	t.FailNow()
}

func TestRect1(t *testing.T) {
	gp := NewBlankImageGlimpsePool(getScreens())
	gp.AddFromBounds("alpha", 10, 300, 200, 1100, 400)
	gp.AddFromBounds("bravo", 20, 0, 100, 1200, 600)    // if the image is in front and contains, then we test the outer
	gp.AddFromBounds("charlie", 30, 100, 400, 800, 500) // if the image is in front and contains, then we test the outer

	// glimpses = append(glimpses, img1)
	// glimpses = append(glimpses, img2)
	// glimpses = append(glimpses, img3)

	// newMinX := img1.Min.X
	// newMaxX := img1.Max.X

	// newMinY := img1.Min.Y
	// newMaxY := img1.Max.Y

	// if img1.Min.X < img2.Min.X && img1.Min.Y < img2.Min.Y {
	// }

	// if img1.Max.X > img2.Max.X && img1.Max.Y > img2.Max.Y {
	// }

	// if img1.Min.X <= img2.Min.X {
	// 	newMinX = img1.Min.X

	// 	if img1.Max.X < img2.Min.X {
	// 		// no overlap, this image's x is unchanged
	// 		newMaxX = img1.Max.X
	// 	}
	// 	if img1.Max.X > img2.Min.X {
	// 		// it overlaps so the max now becomes the min
	// 		newMaxX = img2.Min.X
	// 	}
	// }

	// if img1.Min.Y <= img2.Min.Y {
	// 	newMinY = img1.Min.Y

	// 	if img1.Max.Y <= img2.Min.Y {
	// 		// no overlap, this image's x is unchanged
	// 		newMaxY = img1.Max.Y
	// 	}
	// 	if img1.Max.Y >= img2.Min.Y {
	// 		// it overlaps so the max now becomes the min
	// 		newMaxY = img2.Min.Y
	// 	}
	// }
	// imgLeftFinal := image.Rect(newMinX, newMinY, newMaxX, newMaxY)

	// logRect("Rect", t, imgLeftFinal)

	// eh

	// newGlimpses := DisectGlimpses(img1, img2)
	// for _, g := range newGlimpses {
	// 	glimpses = append(glimpses, g)
	// }
	// newGlimpses = DisectGlimpses(img2, img3)
	// for _, g := range newGlimpses {
	// 	glimpses = append(glimpses, g)
	// }

	// err := glimpses.RenderAsFile(1400, 800)
	// if err != nil {
	// 	t.Fatalf("render failed %v", err)
	// }
}

func TestValidGlimpses(t *testing.T) {
	out := []byte(`[{"bounds":{"y":286,"x":1792,"height":1415,"width":2560},"layer":0,"appName":"Code","windowNumber":0,"windowIsOnScreen":true,"pid":415},{"bounds":{"y":25,"x":200,"height":1095,"width":1792},"layer":10,"appName":"Google Chrome","windowNumber":0,"windowIsOnScreen":true,"pid":426},{"bounds":{"y":428,"x":2128,"height":1078,"width":1712},"layer":20,"appName":"Citrix Viewer","windowNumber":0,"windowIsOnScreen":true,"pid":82079},{"bounds":{"y":1145,"x":-128,"height":1055,"width":1920},"layer":30,"appName":"Slack","windowNumber":0,"windowIsOnScreen":true,"pid":81576},{"bounds":{"y":1145,"x":-128,"height":1055,"width":1920},"layer":40,"appName":"iTerm2","windowNumber":0,"windowIsOnScreen":true,"pid":434},{"bounds":{"y":492,"x":2104,"height":872,"width":1242},"layer":50,"appName":"Messages","windowNumber":0,"windowIsOnScreen":true,"pid":30921},{"bounds":{"y":446,"x":2176,"height":1095,"width":1792},"layer":60,"appName":"Boop","windowNumber":0,"windowIsOnScreen":true,"pid":11832},{"bounds":{"y":1145,"x":-128,"height":1055,"width":1920},"layer":70,"appName":"ClickUp","windowNumber":0,"windowIsOnScreen":true,"pid":6778},{"bounds":{"y":25,"x":0,"height":1095,"width":1792},"layer":80,"appName":"TablePlus","windowNumber":0,"windowIsOnScreen":true,"pid":431},{"bounds":{"y":286,"x":1792,"height":1415,"width":2560},"layer":90,"appName":"GitKraken","windowNumber":0,"windowIsOnScreen":true,"pid":11082},{"bounds":{"y":466,"x":2435,"height":686,"width":1180},"layer":100,"appName":"Alfred Preferences","windowNumber":0,"windowIsOnScreen":true,"pid":84160},{"bounds":{"y":286,"x":1792,"height":510,"width":668},"layer":110,"appName":"System Preferences","windowNumber":0,"windowIsOnScreen":true,"pid":5888},{"bounds":{"y":25,"x":0,"height":1095,"width":1792},"layer":120,"appName":"Postico","windowNumber":0,"windowIsOnScreen":true,"pid":56826},{"bounds":{"y":200,"x":261,"height":720,"width":1270},"layer":130,"appName":"Docker Desktop","windowNumber":0,"windowIsOnScreen":true,"pid":82504}]`)
	windows := make([]*ScreenWindow, 0)
	err := json.Unmarshal(out, &windows)
	if err != nil {
		t.Fatalf("failed to get screen info %v", err)
	}

	gp := NewBlankImageGlimpsePool(getScreens())
	for _, w := range windows {
		gp.AddFromRect(w.AppName, int(w.Layer), w.Bounds.ToRectangle())
	}
	gp.DumpGlimpses()
	gp.RenderAsFile("./test-image.png")
	t.FailNow()
}
