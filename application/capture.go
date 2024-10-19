package main

import (
	"encoding/json"
	"fmt"
	"image"
	"io/fs"
	"math"
	"os"
	"path/filepath"

	"github.com/chai2010/webp"
	"github.com/kbinani/screenshot"
	_ "github.com/mattn/go-sqlite3"
	"github.com/nfnt/resize"
	"github.com/sirupsen/logrus"
)

var IS_DUMP = true

type ScreenCapturer struct {
	binPath string
}

func (cap *ScreenCapturer) CaptureImage() (*image.RGBA, error) {
	minX, minY, maxX, maxY := getScreenBounds()
	bounds := image.Rectangle{
		Min: image.Point{
			X: minX,
			Y: minY,
		},
		Max: image.Point{
			X: maxX,
			Y: maxY,
		},
	}

	img, err := screenshot.CaptureRect(bounds)
	if err != nil {
		return nil, err
	}
	return img, nil
}

func (cap *ScreenCapturer) GetScreenInfo() ([]*ScreenWindow, error) {
	return grabScreenInfo()
}

func (cap *ScreenCapturer) LoadDump(dumpFilePath string) (string, []image.Rectangle, []*ScreenWindow, error) {
	b, err := os.ReadFile(dumpFilePath)
	if err != nil {
		logrus.Error("LoadDump read")
		return "", nil, nil, err
	}
	fd := &FullDump{}
	err = json.Unmarshal(b, fd)
	if err != nil {
		logrus.Error("LoadDump read")
		return "", nil, nil, err
	}

	sws, err := cap.extractScreenWindow([]byte(fd.ScreenWindowsRaw))
	if err != nil {
		logrus.Error("LoadDump extractScreenWindowDump")
		return "", nil, nil, err
	}
	// screens := make([]image.Rectangle, 0)
	// for _, sw := range sws {
	// 	screens = append(screens, sw.Bounds.ToRectangle())
	// }

	return fd.ImagePath, fd.Screens, sws, nil
}

func (cap *ScreenCapturer) SaveDump(dumpFilePath string, imagePath string, screens []image.Rectangle, rejections []string) error {
	d, err := json.Marshal(&FullDump{
		ImagePath: imagePath,
		Screens:   screens,
	})
	if err != nil {
		logrus.Errorf("SaveDump json %v", err)
		return err
	}
	err = os.WriteFile(dumpFilePath, d, fs.ModePerm)
	if err != nil {
		logrus.Errorf("SaveDump write %v", err)
		return err
	}
	logrus.Info("y ->", dumpFilePath)
	return nil
}

func (cap *ScreenCapturer) extractScreenWindow(raw []byte) ([]*ScreenWindow, error) {
	windows := make([]*ScreenWindow, 0)
	if err := json.Unmarshal(raw, &windows); err != nil {
		return nil, err
	}
	return windows, nil
}

func (cap *ScreenCapturer) ImageFromWebp(imgPath string) (image.Image, error) {
	// Open the PNG image file
	file, err := os.Open(imgPath) // THIS IS WEBP deal with that...
	if err != nil {
		return nil, fmt.Errorf("Error opening the file: %s with err %v", imgPath, err)
	}
	defer file.Close()
	wbp, err := webp.Decode(file)
	if err != nil {
		return nil, err
	}
	return wbp, nil
}

func (cap *ScreenCapturer) SaveWebp(fullpath string, filename string, img *image.RGBA) (string, error) {
	fullFilePath := filepath.Join(fullpath, "/", filename)
	err := os.MkdirAll(fullpath, os.ModePerm)
	if err != nil {
		return "", err
	}
	file, err := os.Create(fullFilePath)
	if err != nil {
		return "", err
	}
	defer file.Close()
	// Encode lossless webp

	imageWidth := math.Abs(float64(img.Bounds().Min.X)) + math.Abs(float64(img.Bounds().Max.X))
	resizedWidth := math.Round(imageWidth * 0.80) // RESIZING breaks all glimpse logic on dumps
	newImage := resize.Resize(uint(resizedWidth), 0, img, resize.Lanczos3)
	err = webp.Encode(file, newImage, &webp.Options{Lossless: false, Quality: 80, Exact: false})
	if err != nil {
		return "", err
	}
	return fullFilePath, nil
}
