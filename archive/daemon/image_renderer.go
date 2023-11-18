package main

import (
	"image"
	"image/color"
	"image/png"
	"os"

	"github.com/sirupsen/logrus"
	"golang.org/x/image/font"
	"golang.org/x/image/font/basicfont"
	"golang.org/x/image/math/fixed"
)

//https://stackoverflow.com/questions/28992396/draw-a-rectangle-in-golang

type ImageRenderer struct {
	img   *image.RGBA
	color color.Color
}

func NewImageRenderer(img *image.RGBA) *ImageRenderer {
	return &ImageRenderer{
		img:   img,
		color: color.RGBA{128, 139, 151, 200},
	}
}

func (ir *ImageRenderer) AddLabel(x, y int, label string) {
	point := fixed.Point26_6{
		X: fixed.Int26_6(x * 64),
		Y: fixed.Int26_6(y * 64),
	}

	d := &font.Drawer{
		Dst:  ir.img,
		Src:  image.NewUniform(ir.color),
		Face: basicfont.Face7x13,
		Dot:  point,
	}
	d.DrawString(label)
}

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

	xCenter := (((rect.Max.X - rect.Min.X) / 2) + rect.Min.X) - len(label)
	yCenter := (((rect.Max.Y - rect.Min.Y) / 2) + rect.Min.Y) - 5 // height of font is 10

	ir.AddLabel(xCenter, yCenter, label)
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
