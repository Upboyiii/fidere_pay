import ProductDetailClient from "./product-detail-client"

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params

  // Mock product data
  const product = {
    id: productId,
    name: "稳健增长1号",
    type: "固定收益",
    riskLevel: "低风险",
    expectedReturn: "5.2%",
    actualReturn: "5.4%",
    minAmount: 100000,
    maxAmount: 5000000,
    duration: "180天",
    status: "在售",
    aum: 15000000,
    subscribers: 45,
    channels: ["线上", "私人银行", "财富管理"],
    description:
      "稳健型固定收益产品，适合风险偏好较低的投资者。产品主要投资于高等级债券、货币市场工具等固定收益类资产，追求稳健的投资回报。",
    features: ["低风险", "固定收益", "流动性好", "专业管理"],
    investmentStrategy:
      "本产品采用稳健的投资策略，主要配置AAA级企业债券、政府债券和货币市场工具，严格控制信用风险和流动性风险。",
    riskWarning: "本产品为非保本浮动收益型产品，存在本金损失的风险。过往业绩不代表未来表现。",
    manager: "张经理",
    managerExperience: "10年",
    establishedDate: "2023-06-15",
    maturityDate: "2024-12-15",
  }

  // Mock performance data
  const performanceData = [
    { date: "2024-01", value: 100, benchmark: 100 },
    { date: "2024-02", value: 101.2, benchmark: 100.8 },
    { date: "2024-03", value: 102.5, benchmark: 101.5 },
    { date: "2024-04", value: 103.8, benchmark: 102.2 },
    { date: "2024-05", value: 105.2, benchmark: 103.0 },
    { date: "2024-06", value: 106.5, benchmark: 103.8 },
  ]

  const assetAllocation = [
    { name: "企业债券", value: 45, color: "#1976d2" },
    { name: "政府债券", value: 30, color: "#2e7d32" },
    { name: "货币市场", value: 20, color: "#ed6c02" },
    { name: "其他", value: 5, color: "#9e9e9e" },
  ]

  const subscribers = [
    { id: "C001", name: "张三", amount: 1000000, date: "2024-01-15", status: "持有中" },
    { id: "C002", name: "李四", amount: 2000000, date: "2024-01-10", status: "持有中" },
    { id: "C003", name: "王五", amount: 500000, date: "2024-01-08", status: "已赎回" },
    { id: "C005", name: "钱七", amount: 1500000, date: "2024-01-05", status: "持有中" },
  ]

  const orders = [
    { id: "O001", client: "张三", type: "认购", amount: 1000000, date: "2024-01-15 14:23", status: "已确认" },
    { id: "O002", client: "李四", type: "认购", amount: 2000000, date: "2024-01-10 10:45", status: "已确认" },
    { id: "O003", client: "王五", type: "赎回", amount: 500000, date: "2024-01-08 16:12", status: "已完成" },
    { id: "O004", client: "钱七", type: "认购", amount: 1500000, date: "2024-01-05 09:30", status: "已确认" },
  ]

  const metrics = [
    { label: "管理规模", value: "¥1,500万", icon: "ri-bank-line", color: "primary" },
    { label: "认购人数", value: "45人", icon: "ri-group-line", color: "success" },
    { label: "实际收益", value: "5.4%", icon: "ri-line-chart-line", color: "warning" },
    { label: "运行天数", value: "180天", icon: "ri-calendar-line", color: "info" },
  ]

  return (
    <ProductDetailClient
      product={product}
      performanceData={performanceData}
      assetAllocation={assetAllocation}
      subscribers={subscribers}
      orders={orders}
      metrics={metrics}
    />
  )
}

