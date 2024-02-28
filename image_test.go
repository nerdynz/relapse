package main

import (
	"fmt"
	"image"
	"image/draw"
	"image/png"
	_ "image/png" // Required for initializing the PNG decoder
	"os"
	"testing"

	"github.com/golang/geo/r2"
	"github.com/sirupsen/logrus"
	"gopkg.in/stretchr/testify.v1/assert"
)

func TestTwoRectangles(t *testing.T) {

	screentotal := r2.RectFromPoints(r2.Point{X: 0, Y: 0}, r2.Point{X: 1200, Y: 600})
	screen1 := r2.RectFromPoints(r2.Point{X: 300, Y: 0}, r2.Point{X: 1200, Y: 600})
	screen2 := r2.RectFromPoints(r2.Point{X: 0, Y: 0}, r2.Point{X: 1100, Y: 600})

	p1 := r2.Point{X: 1200, Y: 600}
	p2 := r2.Point{X: 1100, Y: 600}

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
	cap := ScreenCapturer{}
	imgPath, screens, windows, err := cap.LoadDump("./dumps.json")
	if err != nil {
		t.Fatalf("err %v", err)
	}

	img, err := cap.ImageFromWebp(imgPath)
	if err != nil {
		t.Fatalf("err %v", err)
	}

	// Create an RGBA image with the same dimensions as the loaded image
	bounds := img.Bounds()
	rgba := image.NewRGBA(bounds)

	// Draw the loaded image onto the RGBA image
	draw.Draw(rgba, bounds, img, image.Point{0, 0}, draw.Src)
	gp := NewGlimpsePool(rgba, screens)
	for _, w := range windows {
		gp.AddFromRect(w.AppName, int(w.Layer), w.Bounds.ToRectangle())
	}

	rejections := make([]string, 0)
	rejections = append(rejections, "Spotify")
	rejections = append(rejections, "Console")
	// rejections = append(rejections, "Code")
	// gp.DumpGlimpses()
	// gp.GreyOutFromLabels(rejections)
	gp.RenderAsFile("./test-image.png")
}

func TestBlaDraw(t *testing.T) {
	file, err := os.Open("./bla.png")
	if err != nil {
		logrus.Fatal(err)
	}
	defer file.Close()

	// Decode the image
	pn, err := png.Decode(file)
	if err != nil {
		fmt.Println("Error decoding image:", err)
		return
	}

	// Create an RGBA image
	if img, ok := pn.(*image.RGBA); ok {
		// img is now an *image.RGBA
		ir := NewImageRendererDebug(img)
		ir.DrawLabeledRectangle("bla", image.Rect(33, 195, 195+1507, 195+34))

		f, err := os.Create("blaout.png")
		if err != nil {
			logrus.Fatal(err)
		}
		defer f.Close()
		err = png.Encode(f, ir.img)
		if err != nil {
			logrus.Fatal(err)
		}
	}
}
