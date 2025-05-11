package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
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

func getSolutionTree(n *RecipeNode) *RecipeNode {
	// Melakukan pruning pada jalur yang tidak menuju solusi
    if n == nil {
        return nil
    }

    var prunedChildren []*RecipeNode
    for _, c := range n.Children {
        if pc := getSolutionTree(c); pc != nil {
            prunedChildren = append(prunedChildren, pc)
        }
    }

    if len(prunedChildren) == 0 {
        
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

    return &RecipeNode{
        Ingredients: n.Ingredients,
        Product:     n.Product,
        ImageUrl1:   n.ImageUrl1,
        ImageUrl2:   n.ImageUrl2,
        Children:    prunedChildren,
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

func ExportTreeAsJSON(root *RecipeNode) ([]byte, error) {
    jroot := toJSONNode(root)
    return json.MarshalIndent(jroot, "", "  ")
}



// func main() {

//     entries, err := loadEntries("data/elements.json")
//     if err != nil {
//         log.Fatalf("Gagal load entries: %v", err)
//     }

//     idx := buildIndex(entries)

//     rootName := "Lake"      
// 	var countMu sync.Mutex
// 	countRecipe := 0
// 	Nrecipe := 3
// 	// visited := make(map[string]bool)
//     tree := buildBFSRecipeTree(rootName, idx, Nrecipe, &countRecipe, &countMu)
// 	// treeDFS := buildRecipeTree(rootName, idx,visited, Nrecipe, &countRecipe, &countMu)


// 	var count int = 0
// 	treeresult := getSolutionTree(tree)
// 	printRecipeTree(treeresult, "-", &count)

// 	b, err := ExportTreeAsJSON(treeresult)
//     if err != nil {
//         fmt.Println("Error serializing JSON:", err)
//         return
//     }

//     fmt.Println(string(b))

// }

