package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

type Entry struct {
	Category string
	Element  string
	Recipes  string
	ImageUrl string
}

// Json struct
type ElementItem struct {
	Element  string     `json:"Element"`
	Recipes  [][]string `json:"Recipes"`
	ImageUrl string     `json:"ImageUrl"`
}


type JsonTable struct {
	Tier  string           `json:"Tier"`
	Items []ElementItem `json:"Items"`
}

func scrape() bool{
	// Fetch webpage
	res, err := http.Get("https://little-alchemy.fandom.com/wiki/Elements_(Little_Alchemy_2)#Tier_2_elements")
	if err != nil {
		log.Fatal(err)
		return false
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		log.Fatalf("status code error: %d %s", res.StatusCode, res.Status)
		return false
	}

	// Parse HTML
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		log.Fatal(err)
		return false
	}

	var data []Entry

	// Process each header (h2 or h3)
	doc.Find("h2, h3").Each(func(i int, header *goquery.Selection) {
		headerText := header.Text()
		if !strings.Contains(strings.ToLower(headerText), "tier") {
			return
		}

		// Clean category name
		category := strings.ReplaceAll(headerText, "[edit]", "")
		category = strings.ReplaceAll(category, "[]", "")
		category = html.UnescapeString(strings.TrimSpace(category))

		// Find next table
		table := header.NextAllFiltered("table").First()
		if table.Length() == 0 {
			return
		}

		// Process table rows, skipping header
		table.Find("tr").Each(func(j int, row *goquery.Selection) {
			if j == 0 { // Skip header row
				return
			}

			cells := row.Find("td")
			if cells.Length() < 2 {
				return
			}

			// Extract element name
			element := html.UnescapeString(strings.TrimSpace(cells.Eq(0).Text()))

			// Extract image URL from <a> tag
			imageURL := ""
			link := cells.Eq(0).Find("a.mw-file-description.image")
			if href, exists := link.Attr("href"); exists {
				imageURL = href
			}

			// Process recipes from the second cell
			recipeCell := cells.Eq(1)
			var recipes []string

			// Check if there are list items
			listItems := recipeCell.Find("li")
			if listItems.Length() > 0 {
				listItems.Each(func(k int, li *goquery.Selection) {
					recipe := processRecipe(li)
					recipes = append(recipes, recipe)
				})
			} else {
				// Process entire cell
				recipe := processRecipe(recipeCell)
				recipes = append(recipes, recipe)
			}

			// Deduplicate recipes
			uniqueRecipes := deduplicateRecipes(recipes)

			// Add to data
			data = append(data, Entry{
				Category: category,
				Element:  element,
				Recipes:  strings.Join(uniqueRecipes, " | "),
				ImageUrl: imageURL,
			})
		})
	})

	// Write to CSV
	if err := os.MkdirAll("data", 0755); err != nil {
		log.Fatal(err)
		return false
	}
	csvFile, err := os.Create("data/elements.csv")
	if err != nil {
		log.Fatal(err)
		return false
	}
	defer csvFile.Close()

	csvWriter := csv.NewWriter(csvFile)
	defer csvWriter.Flush()

	// Write header
	if err := csvWriter.Write([]string{"Category", "Element", "Recipes", "ImageUrl"}); err != nil {
		log.Fatal(err)
		return false
	}

	// Write rows
	for _, entry := range data {
		row := []string{entry.Category, entry.Element, entry.Recipes, entry.ImageUrl}
		if err := csvWriter.Write(row); err != nil {
			log.Fatal(err)
			return false
		}
	}

	fmt.Printf("Clean CSV created with %d entries!\n", len(data))

	// jsonify the data
	var jsonTable []JsonTable
	for _, entry := range data {
		tier := parseTier(entry.Category)
		recipes := parseRecipes(entry.Recipes)
		elementItem := ElementItem{
			Element:  entry.Element,
			Recipes:  recipes,
			ImageUrl: entry.ImageUrl,
		}

		// Check if the tier already exists in jsonTable
		found := false
		for i := range jsonTable {
			if jsonTable[i].Tier == tier {
			jsonTable[i].Items = append(jsonTable[i].Items, elementItem)
			found = true
			break
			}
		}
		if !found {
			jsonTable = append(jsonTable, JsonTable{
			Tier:  tier,
			Items: []ElementItem{elementItem},
			})
		}
	}

	// json output
	jsonData, err := json.MarshalIndent(jsonTable, "", "  ")

	// write to file
	err = os.WriteFile("data/elements.json",jsonData,0644)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("JSON data successfully written to output.json")

	return true
}

func parseRecipes(recipeStr string) [][]string {
	recipePairs := strings.Split(recipeStr, "|")
	var recipes [][]string
	for _, pair := range recipePairs {
		parts := strings.Split(strings.TrimSpace(pair), "+")
		if len(parts) == 2 {
			left := strings.ToLower(strings.TrimSpace(parts[0]))
			right := strings.ToLower(strings.TrimSpace(parts[1]))
			recipes = append(recipes, []string{left, right})
		}
	}
	return recipes
}

func parseTier(category string) string {
	// Use a regular expression to match "Tier <number>"
	re := regexp.MustCompile(`Tier (\d+)`)
	match := re.FindStringSubmatch(category)

	if len(match) > 1 {
		// match[1] will contain the tier number
		return match[1]
	}
	return ""
}

func processRecipe(s *goquery.Selection) string {
	htmlContent, _ := s.Html()
	// Replace all HTML tags with '+'
	re := regexp.MustCompile(`<[^>]+>`)
	processed := re.ReplaceAllString(htmlContent, "+")
	processed = html.UnescapeString(processed)
	parts := strings.Split(processed, "+")

	seen := make(map[string]bool)
	var cleanedParts []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		if !seen[p] {
			seen[p] = true
			cleanedParts = append(cleanedParts, p)
		}
	}
	return strings.Join(cleanedParts, " + ")
}

func deduplicateRecipes(recipes []string) []string {
	seen := make(map[string]bool)
	var unique []string
	for _, r := range recipes {
		if !seen[r] {
			seen[r] = true
			unique = append(unique, r)
		}
	}
	return unique
}
func getEntries() []Entry{
	file, err := os.Open("data/elements.json")
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()
	byteValue, _ := io.ReadAll(file)
	var jsonTable []JsonTable
	json.Unmarshal(byteValue, &jsonTable)
	var entries []Entry
	for _, table := range jsonTable {
		for _, item := range table.Items {
			recipes := "NULL"
			if len(item.Recipes) > 0 {
				recipes = strings.Join(item.Recipes[0], " + ")
			}
			entries = append(entries, Entry{
				Category: table.Tier,
				Element:  item.Element,
				Recipes:  recipes,
				ImageUrl: item.ImageUrl,
			})
		}
	}
	return entries
}