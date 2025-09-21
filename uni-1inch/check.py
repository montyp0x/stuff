# x^3y + y^3x = k
# k'x = 3x^2y + y^3
# k'y = 3y^2x + x^3
# k'x/k'y = (3x^2y + y^3)/(3y^2x + x^3)

x = 8290
y = 16380

p1 = 3*x**2*y + y**3
p2 = 3*y**2*x + x**3

print(p1/p2)