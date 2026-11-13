import os
from flask import Flask, jsonify, request, send_from_directory
from services.filter_service import load_products, filter_and_sort

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
PRODUCTS = load_products(os.path.join(BASE_DIR, "data", "products.json"))


@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/api/meta")
def meta():
    prices = [p["price"] for p in PRODUCTS]
    return jsonify({
        "categories": sorted({p["category"] for p in PRODUCTS}),
        "min_price": min(prices),
        "max_price": max(prices),
    })


@app.route("/api/products")
def products():
    categories = [c for c in request.args.get("categories", "").split(",") if c]
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    min_rating = request.args.get("min_rating", default=0, type=float)
    sort = request.args.get("sort", "default")
    result = filter_and_sort(PRODUCTS, categories, min_price, max_price, min_rating, sort)
    return jsonify({"count": len(result), "products": result})


if __name__ == "__main__":
    app.run(debug=True)