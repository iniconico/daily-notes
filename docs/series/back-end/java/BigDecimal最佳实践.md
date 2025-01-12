---
title: BigDecimal最佳实践
date: 2024/11/05
tags:
 - java
 - BigDecimal
categories:
 - back-end
---

### 初始化

避免直接使用浮点数进行初始化

```java
BigDecimal val = new BigDecimal(0.1);
System.out.println(num);
打印结果：0.1000000000000000055511151231257827021181583404541015625
```

正确的姿势应该是

```java
    @Test
    public void should_init_with_str() {
        BigDecimal num = new BigDecimal(0.1);
        assertNotEquals("0.1", num.toString());
        BigDecimal str = new BigDecimal("0.1");
        assertEquals("0.1", str.toString());
        BigDecimal value = BigDecimal.valueOf(0.1);
        assertEquals("0.1", value.toString());
    }
```

### 做计算设置精度

```java
BigDecimal a = new BigDecimal("1.03");
BigDecimal b = new BigDecimal("0.42");
//减法
BigDecimal result = a.subtract(b);
System.out.println(result); 

打印结果：：0.61，没问题。
```

上面的减法计算没问题，但是在做除法的时候可能就会带来问题

```java
    @Test
    public void should_throw_exception_when_not_set_rounding_in_calc() {
        BigDecimal var1 = new BigDecimal("10");
        BigDecimal var2 = new BigDecimal("3");
        assertThrows(ArithmeticException.class, () -> {
            var1.divide(var2);
        });
        assertDoesNotThrow(() -> {
            var1.divide(var2, RoundingMode.UP);
        });
    }
```

### 判断相等

在`BigDecimal`中比较时，会比较值和精度，这是要注意的点，所以应该使用 `compareTo`进行比较

```java
@Test
public void should_use_compare_to_to_compare() {
    BigDecimal var1 = new BigDecimal("1");
    BigDecimal var2 = new BigDecimal("1.0");
    assertEquals(0, var1.compareTo(var2));
    assertNotEquals(var1, var2);
}
```

### 不可变性

在 `BigDecimal`中计算得到的结果都是返回新的值，所以我们必须用一个新对象去接收

```java
@Test
public void should_use_new_val_to_receive_calc_result() {
    BigDecimal var1 = new BigDecimal("10");
    BigDecimal var2 = new BigDecimal("3");
    BigDecimal result = var1.divide(var2, 2, RoundingMode.HALF_UP);
    assertEquals("10", var1.toString());
    assertEquals("3", var2.toString());
    assertEquals("3.33", result.toString());
}
```

或者是这样

```java
@Test
public void should_use_value_receive_calc_result() {
    BigDecimal sum = new BigDecimal("10");
    BigDecimal var2 = new BigDecimal("3");
    for (int i = 0; i < 10; i++) {
        sum = sum.add(var2);
    }
    assertEquals("40", sum.toString());
}
```

### 使用 scale 

`scale`: 小数位数

`precision`: 总位数

不要混淆 `scale` 和 `precision`，必要时显式设置小数位数

### 性能问题

```
BigDecimal`虽然十分精确但是也很慢，如果在代码里大量使用它进行计算，会对性能造成巨大损耗，所以如果出现大批量计划的时候，可以使用 `double`进行计算，最后再转回 `BigDecimal
```