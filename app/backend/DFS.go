package main

import (
	"strconv"
	"strings"
	"sync"
)

func buildRecipeTree(product string, idx map[string]Element, visited map[string]bool,  Nrecipe int, countRecipe *int, countMu *sync.Mutex, depth int) (*RecipeNode, bool) {
    key := strings.ToLower(product)
    if visited[key] {
        return nil, false
    }
    visited[key] = true
    defer delete(visited, key)

    e, ok := idx[key]
    if !ok {
        return nil, true
    }

    prodTier, err := strconv.Atoi(e.Tier)
    if err != nil {
        prodTier = 0
    }

    var urlRoot string
    if(depth == 0){
        urlRoot = e.ImageUrl
    } else {
        urlRoot = ""
    }

    root := &RecipeNode{
        Product:  product,
        ImageUrl1: urlRoot,
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
            return root, true
        }
        countMu.Unlock()

        wg.Add(1)
        go func(ing1, ing2 string) {
        defer wg.Done()

        

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

        if(tier1 >= prodTier) {
            url1 = ""
        }

        if(tier2 >= prodTier) {
            url2 = ""
        }

        if(tier1 == 0 ){
            url1 = getBaseUrl(ing1)
        }
        if(tier2 == 0 ){
            url2 = getBaseUrl(ing2)
        }

        combo := &RecipeNode{
            Ingredients: [2]string{ing1, ing2},
            Product:     product,
            ImageUrl1:    url1,
            ImageUrl2:    url2,
        }

        visCopy := copyMap(visited)
        visCopy2 := copyMap(visited)

        var leaf1, leaf2 bool
        leaf1 = false
        leaf2 = false

        if(tier1 < prodTier){
        depth ++
        sub, l := buildRecipeTree(ing1, idx, visCopy, Nrecipe, countRecipe, countMu, depth)
        leaf1 = l
        if sub != nil {
            combo.Children = append(combo.Children, sub)
        }
        }

        if(tier2 < prodTier){
        depth ++
        sub, l := buildRecipeTree(ing2, idx, visCopy2, Nrecipe, countRecipe, countMu, depth)
        leaf2 = l
        if sub != nil {
            combo.Children = append(combo.Children, sub)
        }
        }

        if(depth == 0 ){
            if(leaf1 && leaf2) {
            countMu.Lock()
            (*countRecipe)++
            countMu.Unlock()
        }
        }

        if(leaf1 && leaf2) {
        mu.Lock()
            root.Children = append(root.Children, combo)
        mu.Unlock()
        }
    }(ing1, ing2)
}

    wg.Wait()
    return root,true
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
