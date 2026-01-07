
class Command {

  commands = [];

  amove(units, pos) {
    this.commands.push({ unitTags: units.map(unit => unit.tag), abilityId: 23, targetWorldSpacePos: { x: pos.x, y: pos.y }, direction: { x: pos.x, y: pos.y } });
  }

  attack(unit, target) {
    this.commands.push({ unitTags: [unit.tag], abilityId: 23, targetUnitTag: target.tag, direction: { x: target.pos.x, y: target.pos.y } });
  }

  harvest(unit, resource, direction) {
    this.commands.push({ unitTags: [unit.tag], abilityId: 295, targetUnitTag: resource.tag, direction });
  }

  align(unit, via, resource, direction) {
    this.commands.push({ unitTags: [unit.tag], abilityId: 16, targetWorldSpacePos: { x: via.x, y: via.y }, direction: { x: via.x, y: via.y } });
    this.commands.push({ unitTags: [unit.tag], abilityId: 295, targetUnitTag: resource.tag, queueCommand: true, direction });
  }

  head(units, resource, direction) {
    this.commands.push({ unitTags: units.map(unit => unit.tag), abilityId: 295, targetUnitTag: resource.tag, direction });
  }

  move(unit, pos) {
    this.commands.push({ unitTags: [unit.tag], abilityId: 16, targetWorldSpacePos: { x: pos.x, y: pos.y }, direction: { x: pos.x, y: pos.y } });
  }

  repair(unit, target) {
    this.commands.push({ unitTags: [unit.tag], abilityId: 3685, targetUnitTag: target.tag });
  }

  stop(unit) {
    this.commands.push({ unitTags: [unit.tag], abilityId: 3665, direction: { x: unit.pos.x, y: unit.pos.y } });
  }

  strike(units, target, resource, direction) {
    this.commands.push({ unitTags: units.map(unit => unit.tag), abilityId: 23, targetUnitTag: target.tag, direction: { x: target.pos.x, y: target.pos.y } });
    this.commands.push({ unitTags: units.map(unit => unit.tag), abilityId: 295, targetUnitTag: resource.tag, queueCommand: true, direction });
  }

  land(unit) {
    this.commands.push({ unitTags: [unit.tag], abilityId: 419, targetWorldSpacePos: unit.pos });
    this.commands.push({ unitTags: [unit.tag], abilityId: 413, queueCommand: true });
  }

  lift(unit) {
    this.commands.push({ unitTags: [unit.tag], abilityId: 416 });
    this.commands.push({ unitTags: [unit.tag], abilityId: 417, queueCommand: true });
  }

  build(builder, type, pos) {
    this.commands.push({ unitTags: [builder.tag], abilityId: type, targetWorldSpacePos: { x: pos.x, y: pos.y } });
  }

  resume(builder, building) {
    this.commands.push({ unitTags: [builder.tag], abilityId: 1, targetUnitTag: building.tag });
  }

  train(facility, type) {
    this.commands.push({ unitTags: [facility.tag], abilityId: type });
  }

  step() {
    this.commands.length = 0;
  }

}

export default new Command();
