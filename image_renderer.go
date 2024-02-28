package main

import (
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math"
	"os"

	"github.com/golang/freetype/truetype"
	"github.com/sirupsen/logrus"

	"golang.org/x/image/font"
	"golang.org/x/image/math/fixed"
)

//https://stackoverflow.com/questions/28992396/draw-a-rectangle-in-golang

type ImageRenderer struct {
	img     *image.RGBA
	color   color.Color
	font    *truetype.Font
	isDebug bool
}

func NewImageRenderer(img *image.RGBA) *ImageRenderer {
	return &ImageRenderer{
		img:   img,
		color: color.RGBA{128, 139, 151, 200},
		font:  nil,
	}
}

func NewImageRendererDebug(img *image.RGBA) *ImageRenderer {
	fontBytes, err := os.ReadFile("./assets/RobotoMono.ttf")
	if err != nil {
		logrus.Fatal(err)
	}
	col, err := ParseHexColor("#0080D4")
	if err != nil {
		logrus.Fatal(err)
	}

	f, err := truetype.Parse(fontBytes)
	if err != nil {
		logrus.Fatal(err)
	}
	return &ImageRenderer{
		img:     img,
		color:   col,
		font:    f,
		isDebug: true,
	}
}

func ParseHexColor(s string) (c color.RGBA, err error) {
	c.A = 0xff
	switch len(s) {
	case 7:
		_, err = fmt.Sscanf(s, "#%02x%02x%02x", &c.R, &c.G, &c.B)
	case 4:
		_, err = fmt.Sscanf(s, "#%1x%1x%1x", &c.R, &c.G, &c.B)
		// Double the hex digits:
		c.R *= 17
		c.G *= 17
		c.B *= 17
	default:
		err = fmt.Errorf("invalid length, must be 7 or 4")

	}
	return
}

func (ir *ImageRenderer) AddLabel(x, y int, label string) {
	if ir.isDebug && ir.font != nil {

		// logrus.Info("add label ->", label, x, y)
		// taken from https://github.com/golang/freetype/blob/master/example/drawer/main.go

		size := float64(10)
		dpi := float64(72)
		// spacing := float64(1.0)
		d := &font.Drawer{
			Dst: ir.img,
			Src: image.NewUniform(ir.color),
			Face: truetype.NewFace(ir.font, &truetype.Options{
				Size:    size,
				DPI:     dpi,
				Hinting: font.HintingNone,
			}),
		}
		y = y + int(math.Ceil(size*dpi/72))

		// dy := int(math.Ceil(size * spacing * dpi / 72))
		d.Dot = fixed.Point26_6{
			X: (fixed.I(x) - d.MeasureString(label)),
			Y: fixed.I(y),
		}

		d.DrawString(label)
		// y += dy
		// for _, s := range label {
		// 	d.Dot = fixed.P(10, y)
		// 	d.DrawString(s)
		// 	y += dy
		// }
	}
}

// func AddLabel(x, y int, label string) {
// 	col := color.RGBA{200, 100, 0, 255}
// 	point := fixed.Point26_6{fixed.I(x), fixed.I(y)}

// 	d := &font.Drawer{
// 		Dst:  img,
// 		Src:  image.NewUniform(col),
// 		Face: basicfont.Face7x13,
// 		Dot:  point,
// 	}
// 	d.DrawString(label)
// }

// HLine draws a horizontal line
func (ir *ImageRenderer) HLine(x1, y, x2 int) {
	for ; x1 <= x2; x1++ {
		ir.img.Set(x1, y, ir.color)
	}
}

// VLine draws a veritcal line
func (ir *ImageRenderer) VLine(x, y1, y2 int) {
	for ; y1 <= y2; y1++ {
		ir.img.Set(x, y1, ir.color)
	}
}

// Rect draws a rectangle utilizing HLine() and VLine()
func (ir *ImageRenderer) Rect(x1, y1, x2, y2 int) {
	ir.HLine(x1, y1, x2)
	ir.HLine(x1, y2, x2)
	ir.VLine(x1, y1, y2)
	ir.VLine(x2, y1, y2)
}

func (ir *ImageRenderer) Over(x1, y1, x2, y2 int) {
	// ir.HLine(x1, y1, x2)
	// ir.HLine(x1, y2, x2)
	for i := x1; i < (x2 + 1); i++ {
		ir.VLine(i, y1, y2)
	}
}

func (ir *ImageRenderer) Overlay(rect image.Rectangle) {
	x1 := rect.Min.X
	x2 := rect.Max.X
	y1 := rect.Min.Y
	y2 := rect.Max.Y
	ir.Over(x1, y1, x2, y2)
}

func (ir *ImageRenderer) Rectangle(rect image.Rectangle) {
	x1 := rect.Min.X
	x2 := rect.Max.X
	y1 := rect.Min.Y
	y2 := rect.Max.Y
	ir.Rect(x1, y1, x2, y2)
}

func (ir *ImageRenderer) DrawLabeledRectangle(label string, rect image.Rectangle) {
	ir.Rectangle(rect)

	// xCenter := (((rect.Max.X - rect.Min.X) / 2) + rect.Min.X) - len(label)
	// yCenter := (((rect.Max.Y - rect.Min.Y) / 2) + rect.Min.Y) - 5 // height of font is 10

	ir.AddLabel(rect.Max.X-2, rect.Min.Y+2, label)
}

func (ir *ImageRenderer) DrawGreyedOutRect(label string, rect image.Rectangle) {
	ir.Overlay(rect)
}

func (ir *ImageRenderer) Write(path string) error {
	logrus.Info("writing to ", path)
	f, err := os.Create(path)
	if err != nil {
		return err
	}
	defer f.Close()
	err = png.Encode(f, ir.img)
	if err != nil {
		return err
	}
	return nil
}
