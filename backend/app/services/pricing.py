def calculate_selling_price(cost_price: float, margin_percent: float) -> float:
    return round(cost_price + (cost_price * margin_percent / 100), 2)
