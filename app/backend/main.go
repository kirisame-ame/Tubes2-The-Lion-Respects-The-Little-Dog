package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)
func noCacheMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Next()
	}
}
func main() {
	r := gin.Default()
	r.Use(noCacheMiddleware())
	// Configure CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// API routes - define these before static file handlers
	api := r.Group("/api")
	{
		api.GET("/hello", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "はいいいいい!!"})
		})
		api.GET("/jovkon", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "ルビーちゃん、何が好き？!"})
		})
		api.GET("/scrape",func(c *gin.Context){
			success := scrape()
			if success {
				c.JSON(http.StatusOK, gin.H{"message": "Loading completed!"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"message": "Loading failed!"})
			}
		})
		api.GET("/entries", func(c *gin.Context) {
			entries := getEntries()
			if len(entries) == 0 {
				c.JSON(http.StatusNotFound, gin.H{"message": "No entries found"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"entries": entries})
		})
		api.GET("/search", func(c *gin.Context) {
			target := c.Query("target")
			traversal := c.Query("traversal")
			isMulti := c.Query("isMulti")
			searchNum := c.Query("num")
			if target == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Target parameter is required"})
				return
			}
			if traversal == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Traversal parameter is required"})
				return
			}
			if isMulti == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "isMulti parameter is required"})
				return
			}
			if searchNum == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "searchNum parameter is required"})
				return
			}
			results := search(target,traversal, isMulti, searchNum)
			if len(results) == 0 {
				c.JSON(http.StatusNotFound, gin.H{"message": "No results found"})
			} else {
				c.Data(http.StatusOK, "application/json", results)
			}
		})
	}

	// Serve frontend static files
	r.Static("/static", "./frontend/static")
	r.Static("/assets", "./frontend/assets")

	// Serve index.html for all other routes (SPA routing)
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/index.html")
	})

	r.Run(":8081")
}
