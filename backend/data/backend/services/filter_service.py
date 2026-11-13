import json


def load_products(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def filter_products(products, categories=None, min_price=None, max_price=None, min_rating=0):
    """Keep a product only if it matches ALL active filters.
    Empty or unset filters are skipped (graceful null handling)."""
    result = []
    for p in products:
        if categories and p["category"] not in categories:
            continue
        if min_price is not None and p["price"] < min_price:
            continue
        if max_price is not None and p["price"] > max_price:
            continue
        if min_rating and p["rating"] < min_rating:
            continue
        result.append(p)
    return result


def sort_products(products, sort):
    if sort == "price_asc":
        return sorted(products, key=lambda p: p["price"])
    if sort == "price_desc":
        return sorted(products, key=lambda p: p["price"], reverse=True)
    if sort == "rating_desc":
        return sorted(products, key=lambda p: p["rating"], reverse=True)
    return list(products)


def filter_and_sort(products, categories, min_price, max_price, min_rating, sort):
    # Pipeline: filter the original dataset first, then sort what remains.
    filtered = filter_products(products, categories, min_price, max_price, min_rating)
    return sort_products(filtered, sort)