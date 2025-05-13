package main

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"strings"
	"time"
)

type Element struct {
	Tier     string     `json:"Tier"`
	Name     string     `json:"Element"`
	Recipes  [][]string `json:"Recipes"`
	ImageUrl string     `json:"ImageUrl"`
}

type RecipeNode struct {
	Ingredients [2]string
	Product     string
	Children    []*RecipeNode
	ImageUrl1    string
	ImageUrl2    string
}

type JSONNode struct {
    Product     string      `json:"product"`
    Ingredients [2]string   `json:"ingredients,omitempty"`
    ImageUrl1   string      `json:"imageUrl1"`
    ImageUrl2   string      `json:"imageUrl2"`
    Children    []*JSONNode `json:"children,omitempty"`
}

type Envelope struct {
    Tree    *JSONNode `json:"tree"`
    Elapsed string    `json:"elapsed"`
}


func copyMap(src map[string]bool) map[string]bool {
    dst := make(map[string]bool, len(src))
    for k, v := range src {
        dst[k] = v
    }
    return dst
}

func loadEntries(path string) ([]Element, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var groups []struct {
		Tier  string    `json:"Tier"`
		Items []Element `json:"Items"`
	}
	if err := json.Unmarshal(raw, &groups); err != nil {
		return nil, err
	}
	var all []Element
	for _, g := range groups {
		for _, item := range g.Items {

			item.Tier = g.Tier
			all = append(all, item)
		}
	}
	return all, nil
}

func buildIndex(entries []Element) map[string]Element {
	idx := make(map[string]Element, len(entries))
	for _, e := range entries {
		idx[strings.ToLower(e.Name)] = e
	}
	return idx
}

func isBase(s string) bool {
	switch strings.ToLower(s) {
	case "air", "earth", "fire", "water":
		return true
	}
	return false
}

func getBaseUrl(s string) string {
    switch strings.ToLower(s){
    case "air":
        return "https://static.wikia.nocookie.net/little-alchemy/images/0/03/Air_2.svg"
        
    case "earth":
        return "https://static.wikia.nocookie.net/little-alchemy/images/2/21/Earth_2.svg"
        
    case "fire":
        return "https://static.wikia.nocookie.net/little-alchemy/images/0/01/Fire_2.svg"
        
    case "water":
        return "https://static.wikia.nocookie.net/little-alchemy/images/f/f4/Water_2.svg"
    }
    return ""
}

func printRecipeTree(n *RecipeNode, indent string, count *int) {
    if n == nil {
        return
    }

    (*count)++
    if n.Ingredients != [2]string{} {
        fmt.Printf("%s[%s + %s] → %s\n",
            indent, n.Ingredients[0] , n.Ingredients[1], n.Product)
    } else {
        fmt.Printf("%s%s\n", indent, n.Product)
    }
    for _, c := range n.Children {
        printRecipeTree(c, indent+"  ", count)
    }
}

func minDepthLeaf(n *RecipeNode) int {
    if n == nil {
        return math.MaxInt32
    }
    // leaf check
    if isBase(n.Ingredients[0]) && isBase(n.Ingredients[1]) {
        return 0
    }
    best := math.MaxInt32
    for _, c := range n.Children {
        if d := minDepthLeaf(c); d < best {
            best = d
        }
    }
    if best < math.MaxInt32 {
        return best + 1
    }
    return best
}

func getSolutionTree(n *RecipeNode, lvl int) *RecipeNode {
    if n == nil {
        return nil
    }

    var pruned []*RecipeNode
    for _, c := range n.Children {
        if pc := getSolutionTree(c, lvl+1); pc != nil {
            pruned = append(pruned, pc)
        }
    }

    if len(pruned) == 0 {
        if isBase(n.Ingredients[0]) && isBase(n.Ingredients[1]) {
            return &RecipeNode{
                Ingredients: n.Ingredients,
                Product:     n.Product,
                ImageUrl1:   n.ImageUrl1,
                ImageUrl2:   n.ImageUrl2,
                Children:    nil,
            }
        }
        return nil
    }

    if lvl >= 4 && lvl%2 == 0 {
        bestIdx, bestDepth := 0, math.MaxInt32
        for i, child := range pruned {
            if d := minDepthLeaf(child); d < bestDepth {
                bestDepth, bestIdx = d, i
            }
        }
        pruned = pruned[bestIdx : bestIdx+1]
    }

    return &RecipeNode{
        Ingredients: n.Ingredients,
        Product:     n.Product,
        ImageUrl1:   n.ImageUrl1,
        ImageUrl2:   n.ImageUrl2,
        Children:    pruned,
    }
}

func toJSONNode(n *RecipeNode) *JSONNode {
    if n == nil {
        return nil
    }

	jn := &JSONNode{
		Product:     n.Product,
		Ingredients: n.Ingredients,
		ImageUrl1:   n.ImageUrl1,
		ImageUrl2:   n.ImageUrl2,
	}

	for _, c := range n.Children {
        if jc := toJSONNode(c); jc != nil {
            jn.Children = append(jn.Children, jc)
    	}
	}
    return jn
}

func ExportTreeAsJSON(root *RecipeNode, elapsed time.Duration) ([]byte, error) {
    jroot := toJSONNode(root)

    env := Envelope{
        Tree:    jroot,
        Elapsed: elapsed.String(),
    }
    return json.MarshalIndent(env, "", "  ")
}


