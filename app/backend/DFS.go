package main

import (
	"strconv"
	"strings"
	"sync"
)

func buildRecipeTree(product string, idx map[string]Element, visited map[string]bool,  Nrecipe int, countRecipe *int, countMu *sync.Mutex) *RecipeNode {
    key := strings.ToLower(product)
    if visited[key] {
        return nil
    }
    visited[key] = true
    defer delete(visited, key)

    e, ok := idx[key]
    if !ok {
        return nil
    }

    prodTier, err := strconv.Atoi(e.Tier)
    if err != nil {
        prodTier = 0
    }

    root := &RecipeNode{
        Product:  product,
        ImageUrl1: "",
        Ingredients: [2]string{"", ""},
    }

    var (
        wg  sync.WaitGroup
        mu  sync.Mutex
    )

    for _, rec := range e.Recipes {
        ing1, ing2 := rec[0], rec[1]

        url1 := idx[strings.ToLower(ing1)].ImageUrl
        url2 := idx[strings.ToLower(ing2)].ImageUrl

        countMu.Lock()
        if (*countRecipe) >= Nrecipe {
            countMu.Unlock()
            return root
        }
        countMu.Unlock()

        wg.Add(1)
        go func(ing1, ing2 string) {
        defer wg.Done()

        if isBase(ing1) && isBase(ing2) {
            
            countMu.Lock()
            (*countRecipe)++
            reached := *countRecipe
            countMu.Unlock()

            
            if reached > Nrecipe {
                return
            }

            mu.Lock()
            root.Children = append(root.Children, &RecipeNode{
                Ingredients: [2]string{ing1, ing2},
                Product:     product,
                ImageUrl1:    url1,
                ImageUrl2:    url2,
            })
            mu.Unlock()
            return
        }

        combo := &RecipeNode{
            Ingredients: [2]string{ing1, ing2},
            Product:     product,
            ImageUrl1:    url1,
            ImageUrl2:    url2,
        }

        childelmt1, ok1 := idx[strings.ToLower(ing1)]
        childelmt2, ok2 := idx[strings.ToLower(ing2)]
        var tier1 int
        if ok1 {
            if t, err := strconv.Atoi(childelmt1.Tier); err == nil {
                tier1 = t
            } else {
                tier1 = 0
            }
        } else {
            tier1 = 0
        }

        var tier2 int
        if ok2 {
            if t, err := strconv.Atoi(childelmt2.Tier); err == nil {
                tier2 = t
            } else {
                tier2 = 0
            }
        } else {
            tier2 = 0
        }

        visCopy := make(map[string]bool, len(visited))
        for k, v := range visited {
            visCopy[k] = v
        }

        if(tier1 < prodTier){
        if sub := buildRecipeTree(ing1, idx, visCopy, Nrecipe, countRecipe, countMu); sub != nil {
            combo.Children = append(combo.Children, sub)
        }
        }

        visCopy2 := make(map[string]bool, len(visited))
            for k, v := range visited {
                visCopy2[k] = v
            }

        if(tier2 < prodTier){
        if sub := buildRecipeTree(ing2, idx, visCopy2, Nrecipe, countRecipe, countMu); sub != nil {
            combo.Children = append(combo.Children, sub)
        }
        }
        mu.Lock()
            root.Children = append(root.Children, combo)
        mu.Unlock()
    }(ing1, ing2)
}

    wg.Wait()
    return root
}


// func main() {
//     entries, err := loadEntries("data/elements.json")
//     if err != nil {
//         fmt.Println("Error loading entries:", err)
//         return
//     }
//     idx := buildIndex(entries)
// 	visited := make(map[string]bool)

//     target := "lake"
//     Nrecipe := 3
//     var countMu sync.Mutex
//     countRecipe := 0

//     tree := buildRecipeTree(target, idx,visited, Nrecipe, &countRecipe, &countMu)
//     if tree == nil {
//         fmt.Printf("No recipes for %q\n", target)
//         return
//     }


//     var count int = 0
//     printRecipeTree(tree, "-",&count)
//         fmt.Printf("Nodes traversed: %d", count)
// }
