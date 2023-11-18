package main

import (
	"image"

	"github.com/kbinani/screenshot"
)

type ScreenWindow struct {
	AppName    string             `json:"appName" db:"app_name"`
	IsOnScreen bool               `json:"windowIsOnScreen" db:"-"`
	Layer      int32              `json:"layer" db:"-"`
	Pid        int32              `json:"pid" db:"-"`
	Bounds     ScreenWindowBounds `json:"bounds" db:"-"`
}

type ScreenWindowBounds struct {
	X      int32 `json:"x"`
	Y      int32 `json:"y"`
	Height int32 `json:"height"`
	Width  int32 `json:"width"`
}

func (swb ScreenWindowBounds) ToRectangle() image.Rectangle {
	return image.Rectangle{
		Min: image.Point{
			X: int(swb.X),
			Y: int(swb.Y),
		},
		Max: image.Point{
			X: int(swb.X) + int(swb.Width),
			Y: int(swb.Y) + int(swb.Height),
		},
	}
}

func getScreens() []image.Rectangle {
	n := screenshot.NumActiveDisplays()
	screens := make([]image.Rectangle, 0)
	for i := 0; i < n; i++ {
		screen := screenshot.GetDisplayBounds(i)
		screens = append(screens, screen)
	}
	return screens
}

func getScreenBounds() (minX int, minY int, maxX int, maxY int) {
	n := screenshot.NumActiveDisplays()
	minX, minY, maxX, maxY = 0, 0, 0, 0
	for i := 0; i < n; i++ {
		bounds := screenshot.GetDisplayBounds(i)
		if i == 0 {
			minX = bounds.Min.X
			maxX = bounds.Max.X
			minY = bounds.Min.Y
			maxY = bounds.Max.Y
			continue
		}

		if bounds.Min.X < minX {
			minX = bounds.Min.X
		}
		if bounds.Max.X > maxX {
			maxX = bounds.Max.X
		}
		if bounds.Min.Y < minY {
			minY = bounds.Min.Y
		}
		if bounds.Max.Y > maxY {
			maxY = bounds.Max.Y
		}
	}
	return minX, minY, maxX, maxY
}
