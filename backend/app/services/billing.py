def calculate_discount(amount: float, discount_percent: float) -> float:
    return amount * discount_percent / 100


def calculate_final_price(price: float, quantity: int, discount_percent: float):
    total = price * quantity
    discount = calculate_discount(total, discount_percent)
    return total, discount, total - discount
